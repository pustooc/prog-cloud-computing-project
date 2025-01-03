const express = require('express');

const Comment = require('../models/Comment');
const Interaction = require('../models/Interaction');
const Message = require('../models/Message');
const verifyToken = require('../utils/verifyToken');
const {commentValidation, messageValidation} = require('../utils/validation');

const router = express.Router();

router.post('/:topic', verifyToken, async(request, response) => {
    // Validation to check user input
    const {error} = messageValidation(request.body);
    if (error) {
        return response.status(400).send({message: error['details'][0]['message']});
    }

    const messageData = new Message({
        title: request.body.title,
        topic: request.params.topic,
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

router.get('/:topic', verifyToken, async(request, response) => {
    try {
        // Get messages filtered by topic
        const messages = await Message.find({
            topic: request.params.topic
        })
        .populate('comments');
        
        // Set properties that are not already attributes in the Message model
        const messagesWithStatus = messages.map(message => {
            const messageObject = message.toObject();
            messageObject['status'] = Date.now() < message['expire_at'] ? 'Live' : 'Expired';
            return messageObject;
        });

        response.send(messagesWithStatus);
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

    // Validation to check if message status is Expired
    if (Date.now() > message['expire_at']) {
        return response.status(400).send({message: 'The message has Expired'});
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
        // Also increase interaction count of the message
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

    // Validation to check if message status is Expired
    if (Date.now() > message['expire_at']) {
        return response.status(400).send({message: 'The message has Expired'});
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
        // Also increase interaction count of the message
        const updateMessageById = await Message.updateOne(
            {_id: request.params.messageId},
            {$set: {
                dislikes: message['dislikes'] + 1
            }}
        );
        response.send({saved_interaction: interactionToSave, updated_message: updateMessageById});
    } catch(err) {
        response.send({message: err});
    }
});

router.post('/:messageId/comment', verifyToken, async(request, response) => {
    // Validation to check user input
    const {error} = commentValidation(request.body);
    if (error) {
        return response.status(400).send({message: error['details'][0]['message']});
    }

    const message = await Message.findById(request.params.messageId);

    // Validation to check if message status is Expired
    if (Date.now() > message['expire_at']) {
        return response.status(400).send({message: 'The message has Expired'});
    }

    const commentData = new Comment({
        message_id: request.params.messageId,
        owner: request.body.owner,
        body: request.body.body,
        time_until_expiration: message['expire_at'] - Date.now()
    });

    // Try to insert
    try {
        const commentToSave = await commentData.save();
        response.send(commentToSave);
    } catch(err) {
        response.send({message: err});
    }
});

router.get('/:topic/expired', verifyToken, async(request, response) => {
    try {
        // Get messages filtered by topic and Expired status
        const messages = await Message.find({
            topic: request.params.topic,
            expire_at: {$lt: Date.now()}
        })
        .populate('comments');;

        // Set properties that are not already attributes in the Message model
        const messagesWithStatus = messages.map(message => {
            const messageObject = message.toObject();
            messageObject['status'] = 'Expired';
            return messageObject;
        });

        response.send(messagesWithStatus);
    } catch(err) {
        response.status(400).send({message: err});
    }
});

router.get('/:topic/highest-interest', verifyToken, async(request, response) => {
    try {
        // Get a message filtered by topic, Live status, and highest total likes and dislikes
        const messages = await Message.aggregate([
            {$match : {
                topic: request.params.topic,
                expire_at: {$gt: new Date()}
            }},
            {$addFields: {total_interest: {$add: ['$likes', '$dislikes']}}},
            {$sort: {total_interest: -1}},
            {$limit: 1}
        ]);

        // Separately populate as aggregate().populate() chaining doesn't work
        const populatedMessages = await Message.populate(messages, {path: 'comments'});

        // Set properties that are not already attributes in the Message model
        const messageWithStatus = populatedMessages[0];
        messageWithStatus['status'] = 'Live';
        
        response.send(messageWithStatus);
    } catch(err) {
        response.status(400).send({message: err});
    }
});

module.exports = router;
