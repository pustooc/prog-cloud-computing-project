const { send } = require('express/lib/response');
const jsonwebtoken = require('jsonwebtoken');

function auth(request, response, next) {
    const token = request.header('auth-token');
    if (!token) {
        return response.status(401).send({message: 'Access denied'});
    }
    
    try {
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
        request.user = verified;
        next();
    } catch(err) {
        return response.status(401).send({message: 'Invalid token'});
    }
}

module.exports = auth;
