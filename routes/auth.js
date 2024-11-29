const bcryptjs = require('bcryptjs')
const express = require('express')
const jsonwebtoken = require('jsonwebtoken')

const User = require('../models/User')
const {registerValidation, loginValidation} = require('../utils/validation')

const router = express.Router()

router.post('/register', async(request, response) => {
    // Validation 1 to check user input
    const {error} = registerValidation(request.body);
    if (error) {
        return response.status(400).send({message: error['details'][0]['message']});
    }

    // Validation 2 to check if user exists
    const userExists = await User.findOne({email: request.body.email});
    if (userExists) {
        return response.status(400).send({message: 'User already exists'});
    }

    // Create a hashed representation of password
    const salt = await bcryptjs.genSalt(5);
    const hashedPassword = await bcryptjs.hash(request.body.password, salt);

    // Code to insert data
    const user = new User({
        username: request.body.username,
        email: request.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        response.send(savedUser);
    } catch(err) {
        response.status(400).send({message: err});
    }
});

router.post('/login', async(request, response) => {
    // Validation 1 to check user input
    const {error} = loginValidation(request.body);
    if (error) {
        return response.status(400).send({message: error['details'][0]['message']});
    }

    // Validation 2 to check if user exists!
    const user = await User.findOne({email: request.body.email});
    if (!user) {
        return response.status(400).send({message: 'User does not exist'});
    } 
    
    // Validation 3 to check user password
    const passwordValidation = await bcryptjs.compare(request.body.password, user.password);
    if (!passwordValidation) {
        return response.status(400).send({message: 'Password is wrong'});
    }
    
    // Generate an auth-token
    const token = jsonwebtoken.sign({_id: user._id}, process.env.TOKEN_SECRET);
    response.header('auth-token', token).send({'auth-token': token});

})

module.exports = router
