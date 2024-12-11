const express = require('express');

const Comment = require('../models/Comment');
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
    const comments = await Comment.find({
        message_id: id
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

router.post('/:messageId/like', verifyToken, async(request, response) => {
    const message = await Message.findById(request.params.messageId);

    // Validation to check if the user is liking/disliking her own message
    if (message['owner'] === request.body.owner) {
        return response.status(400).send({message: 'User cannot like/dislike his own message'});
    }

    // Validation to check if the user has already liked/disliked the message
    const interactionExists = await Interaction.findOne({
        message_id: request.params.messageId,
        owner: request.body.owner
    });
    if (interactionExists) {
        return response.status(400).send({message: 'User cannot like/dislike a message multiple times'});
    }

    const interactionData = new Interaction({
        message_id: request.params.messageId,
        owner: request.body.owner,
        type: 'like',
        time_until_expiration: message['expire_at'] - Date.now()
    });

    // Try to insert
    try {
        const interactionToSave = await interactionData.save();
        const updateMessageById = await Message.updateOne(
            {_id: request.params.messageId},
            {$set: {
                likes: message['likes'] + 1
            }}
        );
        response.send({saved_interaction: interactionToSave, updated_message: updateMessageById});
    } catch(err) {
        response.send({message: err});
    }
});

router.post('/:messageId/dislike', verifyToken, async(request, response) => {
    const message = await Message.findById(request.params.messageId);

    // Validation to check if the user is liking/disliking her own message
    if (message['owner'] === request.body.owner) {
        return response.status(400).send({message: 'User cannot like/dislike his own message'});
    }

    // Validation to check if the user has already liked/disliked the message
    const interactionExists = await Interaction.findOne({
        message_id: request.params.messageId,
        owner: request.body.owner
    });
    if (interactionExists) {
        return response.status(400).send({message: 'User cannot like/dislike a message multiple times'});
    }

    const interactionData = new Interaction({
        message_id: request.params.messageId,
        owner: request.body.owner,
        type: 'dislike',
        time_until_expiration: message['expire_at'] - Date.now()
    });

    // Try to insert
    try {
        const interactionToSave = await interactionData.save();
        const updateMessageById = await Message.updateOne(
            {_id: request.params.messageId},
            {$set: {
                likes: message['dislikes'] + 1
            }}
        );
        response.send({saved_interaction: interactionToSave, updated_message: updateMessageById});
    } catch(err) {
        response.send({message: err});
    }
});

module.exports = router;
