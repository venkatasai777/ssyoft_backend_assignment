
const dotEnv = require('dotenv')
const jwt = require('jsonwebtoken')
const Register = require('../Models/RegistrationModel')

dotEnv.config()

const secretkey = process.env.SECRET_KEY

const verifyToken = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({error: "Token is required"});
    }
    try {
        const decoded = jwt.verify(token, secretkey);
        const user = await Register.findById(decoded.user._id);
        if (!user) {
            return res.status(404).json({error: "user not found"});
        }
        next()
    }catch (error) {
        console.error(error);
        return res.status(500).json({error: "Invalid Token"});
    }
}


module.exports = verifyToken
