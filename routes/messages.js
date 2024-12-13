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

async function getCommentsForOneMessage(id) {
    const comments = await Comment.find({
        message_id: id
    });

    return comments;
};

router.get('/:topic', verifyToken, async(request, response) => {
    try {
        // Get messages filtered by topic
        const messages = await Message.find({
            topic: request.params.topic
        })
        .populate('comments');
        
        // Set properties that are not already attributes in the Message model
        messages.forEach((message) => {
            message['status'] = Date.now() < message['expire_at'] ? 'Live' : 'Expired';
            //message['comments'] = getCommentsForOneMessage(message['_id']);
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
            expire_at: {$lt: now}
        })
        .populate('comments');;

        // Set properties that are not already attributes in the Message model
        messages.forEach((message) => {
            message['status'] = 'Expired';
            //message['comments'] = getCommentsForOneMessage(message['_id']);
        });

        response.send(messages);
    } catch(err) {
        response.status(400).send({message: err});
    }
});

router.get('/:topic/highest-interest', verifyToken, async(request, response) => {
    try {
        // Get a message filtered by topic, Live status, and highest total likes and dislikes
        const message = await Message.aggregate([
            {$match : {
                topic: request.params.topic,
                expire_at: {$gt: Date.now()}
            }},
            {$addFields: {sumLikesDislikes: {$sum: ['$likes', '$dislikes']}}},
            {$sort: {sumLikesDislikes: -1}},
            {$limit: 1}
        ])
        .populate('comments');

        // Set properties that are not already attributes in the Message model
        message['status'] = 'Live';
        //message['comments'] = getCommentsForOneMessage(message['_id']);

        response.send(message);
    } catch(err) {
        response.status(400).send({message: err});
    }
});

module.exports = router;
