const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');//connects to mongodb database
const axios = require('axios');

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

const users = {};
const lobbies = {};

io.on('connection', socket => {
    console.log("socket id (server): ", socket.id);

    socket.on('initUser', (uuid) => {
        socket.join(`user-${uuid}`);
        console.log(`${uuid} just joined`);
        users[socket.id] = uuid;
    })

    socket.on('send-invite', (invite, recipientUuid, hostUsername) => {
        console.log(`invite sent to ${recipientUuid}`);
        io.to(`user-${recipientUuid}`).emit('receive-invite', invite, hostUsername);
    })

    socket.on('accept-invite', (invite, user) => {
        console.log("someone accepted an invite");
        socket.join(invite.lobbyID);
        socket.broadcast.to(invite.lobbyID).emit('update-lobby', invite, user.username, "accept");
        lobbies[invite.lobbyID][socket.id] = user.id;
        console.log("joined " + invite.lobbyID + " with ID " + lobbies[invite.lobbyID][socket.id]);
    })

    socket.on('decline-invite', (invite, username) => {
        io.to(invite.lobbyID).emit('update-lobby', invite, username, "decline"); 
    })

    socket.on('leave-lobby', (invite, username) => {
        socket.emit('player-left', invite);     
        socket.leave(invite.lobbyID);   
        io.to(invite.lobbyID).emit('update-lobby', invite, username, "leave");
        delete lobbies[invite.lobbyID][socket.id];
    })

    socket.on('join-lobby-as-host', (invite) => {
        socket.join(invite.lobbyID);
        if (!lobbies[invite.lobbyID]) {
            lobbies[invite.lobbyID] = {};
        }    
        lobbies[invite.lobbyID][socket.id] = invite.players[0].uuid;
    })

    socket.on('host-left-lobby', (invite) => {
        io.to(invite.lobbyID).emit('host-left', invite);
        io.in(invite.lobbyID).socketsLeave(invite.lobbyID);
        socket.emit('set-inactive', invite.lobbyID);
        delete lobbies[invite.lobbyID];
    })

    socket.on('disconnect', async () => {
        const uuid = users[socket.id];
        delete users[socket.id];
    
        for (const lobbyID in lobbies) { // iterate through active lobbies
            const lobby = lobbies[lobbyID];

            if (lobby[socket.id] === uuid) { // find the one that the now disconnected user is in
                const index = Object.keys(lobby).indexOf(socket.id);

                if (index === 0) { // host has index 0 because they are the first player to join a lobby
                    // needed in the case that invited users accept an invite from a now dead lobby
                    axios.post('http://localhost:5050/invites/setLobbyInactive', {lobbyID: lobbyID});

                    // send disconnect message to other people in the lobby, if any
                    io.to(lobbyID).emit('host-disconnect', lobbyID);
                    io.in(lobbyID).socketsLeave(lobbyID);

                    // remove the entire lobby from the object since it is now inactive
                    delete lobbies[lobbyID];
                }
                else { // if the person who left is not the host
                    const res = await axios.post(`http://localhost:5050/invites/updateInviteOnDisconnect/${uuid}`,
                        {
                            lobbyID: lobbyID, 
                            isHost: false
                        }
                    );
                    const { invite, retPlayer } = res.data;
                    io.to(lobbyID).emit('player-disconnect', invite, retPlayer.username);

                    // remove that player from the lobby object
                    delete lobbies[lobbyID][socket.id];
                }

                break;
            }
        }
    })
})