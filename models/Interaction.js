const mongoose = require('mongoose');

const interactionSchema = mongoose.Schema({
    message_id: {
        type: String,
        require: true
    },
    owner: {
        type: String,
        require: true,
        min: 3,
        max: 256
    },
    type: {
        type: String,
        require: true,
        enum: ['like', 'dislike'],
        message: 'Invalid interaction type'
    },
    time_until_expiration: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('interactions', interactionSchema);
