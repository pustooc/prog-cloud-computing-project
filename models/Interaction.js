const mongoose = require('mongoose');

const interactionSchema = mongoose.Schema({
    post_id: {
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
        enum: ['like', 'dislike', 'comment'],
        message: 'Invalid interaction type'
    },
    comment: {
        type: String,
        min: 1,
        max: 256
    },
    time_until_expiration: {
        type: Number
    }
});

module.exports = mongoose.model('interactions', interactionSchema);
