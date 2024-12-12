const mongoose = require('mongoose');

const interactionSchema = mongoose.Schema({
    message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
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

// Unique constraint for message_id and owner as a group
interactionSchema.index({message_id: 1, owner: 1}, {unique: true});

module.exports = mongoose.model('interactions', interactionSchema);
