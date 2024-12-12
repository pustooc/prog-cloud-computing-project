const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
        min: 1,
        max: 256
    },
    topic: {
        type: String,
        require: true
    },
    posted_at: {
        type: Date,
        default: Date.now()
    },
    body: {
        type: String,
        require: true,
        min: 1,
        max: 256
    },
    expire_at: {
        type: Date,
        default: Date.now() + 1000*60*60*12 // Add 12 hours
    },
    owner: {
        type: String,
        require: true,
        min: 3,
        max: 256
    },
    likes: {
        type: Number,
        require: true
    },
    dislikes: {
        type: Number,
        require: true
    }
});

// Make frequent queries to comments easier
messageSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'message_id'
});
messageSchema.set('toObject', {virtuals: true});
messageSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('messages', messageSchema);
