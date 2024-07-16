const express = require('express');
const mongoose = require('mongoose');
const dotEnv = require('dotenv');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const Register = require('./Models/RegistrationModel');
const verifyToken = require('./Auth/AuthController');
const Post = require('./Models/PostModel');


const app = express()
app.use(cors())
dotEnv.config()
const PORT = process.env.PORT || 4000

app.listen(PORT, ()=>console.log("Server started and running successfully"));
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo DB connected successfully"))
.catch((err) => console.log(err))


const secretkey = process.env.SECRET_KEY

app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.send("Welcome to Fuse")
})
app.post('/register', async (req, res) => {
    const {username, email, password, role} = req.body
    try {
        const userEmail = await Register.findOne({"email": email});
        if (userEmail) {
            return res.status(400).json("Email Already Exists")
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Register({
            username,
            email,
            password: hashedPassword,
            role
        });
        await newUser.save();

        res.status(201).json({message: "User Created"});
        console.log("registered");
    }catch(error) {
        console.error(error)
        res.status(501).json({error: "Internal server Error"})
    }
})

app.post('/login', async (req, res) => {
    const {email, password } = req.body
    try {
        const user = await Register.findOne({email}) ;
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({error: "Invalid username or Password"});
        }

        const token = jwt.sign({user}, secretkey, {expiresIn: "90h"});
        res.status(200).json({success: "Login Successful", token});
    }catch (error) {
        res.status(500).json({error: "Internal Server error"});
    }
})

app.post('/user/createpost', verifyToken, async (req, res,) => {
    const {title, description, inventoryCount} = req.body
    const token = req.headers.token;
    const decoded = jwt.verify(token, secretkey);
    const {user} = decoded
    if (user.role !== 'admin') {
        return res.status(403).json({error: "Permission denied to create"});
    }
    try {
        const newPost = new Post({
            title,
            description,
            inventoryCount,
            userId: user._id
        })
        await newPost.save();
        return res.status(201).json({message: "Post Created", postId : newPost._id});
    }catch(err) {
        return res.status(500).json({error: "Internal Server Error"});
    }
});
app.get('/user/allposts', verifyToken, async (req, res,) => {
    const token = req.headers.token;
    const decoded = jwt.verify(token, secretkey);
    const {user} = decoded
    if (user.role === 'staff') {
        return res.status(403).json({error: "Permission denied to create"});
    }
    try {
        const allPosts = await Post.find();
        const particularPosts = await allPosts.filter((each) => {
            return each.userId.map((each) => each === user._id)
        })
        return res.status(201).json({message: "Post Created", posts: particularPosts});
    }catch(err) {
        return res.status(500).json({error: "Internal Server Error"});
    }
});
app.delete('/user/deletepost/:id', verifyToken, async (req, res,) => {
    const {id} = req.params
    const token = req.headers.token;
    const decoded = jwt.verify(token, secretkey);
    const {user} = decoded
    if (user.role !== 'admin') {
        return res.status(403).json({error: "Permission denied to create"});
    }
    try {
        const deletedPost = await Post.findByIdAndDelete(id);
        return res.status(201).json({message: "Post deleted", deletedPost});
    }catch(err) {
        return res.status(500).json({error: "Internal Server Error"});
    }
});
app.put('/user/updatepost/:id', verifyToken, async (req, res,) => {
    const {id} = req.params
    const updateData = req.body
    if (user.role !== 'staff') {
        return res.status(403).json({error: "Permission denied to create"});
    }
    try {
        const postToBeUpdated = await Post.findById(id);
        const UpdatedPost = await {...postToBeUpdated, ...updateData}
        await Post.update({id}, {$set : {...updateData}})
        return res.status(201).json({message: "Post Updated", UpdatedPost});
    }catch(err) {
        return res.status(500).json({error: "Internal Server Error"});
    }
});



