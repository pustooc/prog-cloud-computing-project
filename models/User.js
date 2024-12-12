const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 3,
        max: 256,
        unique: true
    },
    email: {
        type: String,
        require: true,
        min: 6,
        max: 256,
        unique: true
    },
    password: {
        type: String,
        require: true,
        min: 6,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('users', userSchema);
