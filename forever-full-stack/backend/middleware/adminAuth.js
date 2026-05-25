import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
        const isLegacyToken = tokenDecode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
        const isAdminToken =
            typeof tokenDecode === 'object' &&
            tokenDecode?.role === 'admin' &&
            tokenDecode?.email === process.env.ADMIN_EMAIL

        if (!isLegacyToken && !isAdminToken) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth
