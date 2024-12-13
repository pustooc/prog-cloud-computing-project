const joi = require('joi');

const registerValidation = (data) => {
    const schemaValidation = joi.object({
        username: joi.string().required().min(3).max(256),
        email: joi.string().required().min(6).max(256).email(),
        password: joi.string().required().min(6).max(1024)        
    });
    return schemaValidation.validate(data);
};

const loginValidation = (data) => {
    const schemaValidation = joi.object({
        email: joi.string().required().min(6).max(256).email(),
        password: joi.string().required().min(6).max(1024)        
    });
    return schemaValidation.validate(data);
};

const messageValidation = (data) => {
    const schemaValidation = joi.object({
        title: joi.string().required().min(1).max(256),
        body: joi.string().required().min(1).max(256),
        owner: joi.string().required().min(3).max(256)
    });
    return schemaValidation.validate(data);
};

const commentValidation = (data) => {
    const schemaValidation = joi.object({
        body: joi.string().required().min(1).max(256),
        owner: joi.string().required().min(3).max(256)
    });
    return schemaValidation.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.messageValidation = messageValidation;
module.exports.commentValidation = commentValidation;
