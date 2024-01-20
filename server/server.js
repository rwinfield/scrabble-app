const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');//connects to mongodb database

const dotenv = require('dotenv').config({ path: './.env.mongo' });

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const uri = process.env.REACT_APP_ATLAS_URI;
console.log(uri);
mongoose.connect(uri, {});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const userRouter = require('./routes/users');
const inviteRouter = require('./routes/invites');

app.use('/users', userRouter);
app.use('/invites', inviteRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const io = require("socket.io")(4000, {
    cors: {
        origin: ['http://localhost:3000']
    }
})

io.on('connection', socket => {
    console.log("socket id (server): ", socket.id);

    socket.on('initUser', uuid => {
        socket.join(`user-${uuid}`);
        socket.join('receive-invite');
        console.log(`${uuid} just joined`);
    })

    socket.on('send-invite', (invite, recipientUuid, hostUsername) => {
        console.log(`invite sent to ${recipientUuid}`);
        io.to(`user-${recipientUuid}`).emit('receive-invite', invite, hostUsername);
    })
})