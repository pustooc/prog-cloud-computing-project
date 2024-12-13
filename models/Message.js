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
        require: true,
        validate: {
            validator: function(value) {
                const allowedValues = ['Politics', 'Health', 'Sports', 'Tech'];
                return allowedValues.includes(value);
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

// Doesn't work - perhaps an issue with Date.now(). Future work
// messageSchema.virtual('status').get(() => Date.now() < this.expire_at ? 'Live' : 'Expired');

// Always read comments linked to a message's _id, as comments are always
// displayed when reading messages
messageSchema.virtual('comments', {
    ref: 'comments',
    localField: '_id',
    foreignField: 'message_id'
});
messageSchema.set('toObject', {virtuals: true});
messageSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('messages', messageSchema);
