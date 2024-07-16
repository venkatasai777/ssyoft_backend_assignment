const mongoose = require('mongoose')

const RegisterSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
            type: String,
            required: true,
            default: 'none'
        }
    
})
const Register = new mongoose.model("Register", RegisterSchema)

module.exports = Register