const express = require('express');

const Interaction = require('../models/Interaction');
const Message = require('../models/Message');
const verifyToken = require('../verifyToken');

const router = express.Router();

router.post('/', verifyToken, async(request, response) => {
    const messageData = new Message({
        title: request.body.title,
        topic: request.body.topic,
        body: request.body.body,
        owner: request.body.owner,
        likes: 0,
        dislikes: 0
    });

    // Try to insert
    try {
        const messageToSave = await messageData.save();
        response.send(messageToSave);
    } catch(err) {
        response.send({message: err});
    }
});

async function getCommentsForOneMessage(id) {
    const comments = await Interaction.find({
        message_id: id,
        type: 'comment'
    });
    return comments;
};

router.get('/', verifyToken, async(request, response) => {
    try {
        const messages = await Message.find();
        messages.forEach((message) => {
            // Determine message status here as it is not an attribute in the model
            message['status'] = Date.now() < message['expire_at'] ? 'Live' : 'Expired';
            // Get comments that are linked to the message
            message['comments'] = getCommentsForOneMessage(message['_id']);
        });
        response.send(messages);
    } catch(err) {
        response.status(400).send({message: err});
    }
});

module.exports = router;
