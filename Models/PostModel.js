const mongoose = require('mongoose');
const Register = require('./RegistrationModel')

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    inventoryCount: {
        type: Number,
        required: true,
    },
    userId: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Register'
        }
    ]
})
const Post = new mongoose.model("Post", PostSchema)

module.exports = Post