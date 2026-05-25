import express from 'express';
import { loginUser, registerUser, verifyRegisterOtp, sendResetOtp, resetPassword, adminLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/verify-register-otp', verifyRegisterOtp)
userRouter.post('/send-reset-otp', sendResetOtp)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)

export default userRouter;
