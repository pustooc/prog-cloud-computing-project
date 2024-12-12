const bodyParser = require('body-parser');
require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');

const messagesRoute = require('./routes/messages');
const authRoute = require('./routes/auth');

const app = express();
app.use(bodyParser.json());
app.use('/api/messages', messagesRoute);
app.use('/api/user', authRoute);

mongoose.connect(process.env.DB_CONNECTOR).then(() => { console.log('Your mongoDB connector is on...')})

app.listen(3000, ()=>{
    console.log('Server is running on port 3000')
})
