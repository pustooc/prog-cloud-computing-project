const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
        min: 1,
        max: 256
    },
    topic: {
        type: [String],
        require: true,
        validate: {
            validator: function(values) {
                const allowedValues = ['Politics', 'Health', 'Sport', 'Tech'];
                return values.every(value => allowedValues.includes(value));
            },
            message: properties => `Invalid topic(s) detected: ${properties.value}`
        }
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

module.exports = mongoose.model('messages', messageSchema);
