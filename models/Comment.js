const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'messages',
        require: true
    },
    owner: {
        type: String,
        require: true,
        min: 3,
        max: 256
    },
    body: {
        type: String,
        require: true,
        min: 1,
        max: 256
    },
    time_until_expiration: {
        type: Number,
        require: true
    }
});

module.exports = mongoose.model('comments', commentSchema);
