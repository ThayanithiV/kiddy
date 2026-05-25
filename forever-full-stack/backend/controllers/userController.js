import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

const createOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_MAIL, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.");
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === "true",
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

const sendOtpMail = async ({ email, name, otp, subject, purpose }) => {
    const transporter = createTransporter();
    const sender = process.env.SMTP_MAIL || process.env.SMTP_USER;

    await transporter.sendMail({
        from: sender,
        to: email,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${name || "User"},</h2>
                <p>Your OTP for ${purpose} is:</p>
                <h1 style="letter-spacing: 6px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
            </div>
        `,
    });
};

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        if (!user.isVerified) {
            return res.json({ success: false, message: "Please verify your email with OTP before logging in" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim()) {
            return res.json({ success: false, message: "Please enter your name" });
        }

        if (!validator.isEmail(email || "")) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser?.isVerified) {
            return res.json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = createOtp();
        const verifyOtpExpiresAt = Date.now() + 10 * 60 * 1000;

        let user = existingUser;

        if (user) {
            user.name = name;
            user.password = hashedPassword;
            user.verifyOtp = otp;
            user.verifyOtpExpiresAt = verifyOtpExpiresAt;
            user.isVerified = false;
        } else {
            user = new userModel({
                name,
                email,
                password: hashedPassword,
                verifyOtp: otp,
                verifyOtpExpiresAt,
                isVerified: false,
            });
        }

        await user.save();

        await sendOtpMail({
            email,
            name,
            otp,
            subject: "Verify your account OTP",
            purpose: "account verification",
        });

        res.json({ success: true, message: "OTP sent to your email. Please verify your account." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            const token = createToken(user._id);
            return res.json({ success: true, message: "Account already verified", token });
        }

        if (!user.verifyOtp || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (Date.now() > user.verifyOtpExpiresAt) {
            return res.json({ success: false, message: "OTP expired. Please register again to get a new OTP" });
        }

        user.isVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiresAt = 0;
        await user.save();

        const token = createToken(user._id);
        res.json({ success: true, message: "Account verified successfully", token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!validator.isEmail(email || "")) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = createOtp();
        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendOtpMail({
            email,
            name: user.name,
            otp,
            subject: "Reset password OTP",
            purpose: "password reset",
        });

        res.json({ success: true, message: "Password reset OTP sent to your email" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (Date.now() > user.resetOtpExpiresAt) {
            return res.json({ success: false, message: "OTP expired. Please request a new OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetOtp = "";
        user.resetOtpExpiresAt = 0;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { role: "admin", email },
                process.env.JWT_SECRET
            );
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { loginUser, registerUser, verifyRegisterOtp, sendResetOtp, resetPassword, adminLogin };
