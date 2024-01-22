const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    isHost: {
        type: Boolean,
        required: true
    },
    accepted: {
        type: Boolean,
        required: true
    },
    declined: {
        type: Boolean,
        required: true
    }
})

const inviteSchema = new Schema({
    active: {
        type: Boolean,
        required: true
    },
    lobbyID: {
        type: String,
        unique: true,
        required: true,
        trim: true 
    },
    date: {
        type: Date,
        required: true,
        trim: true 
    },
    players: {
        type: [playerSchema],
        required: true
    }

}, {
    timestamps: true
})

const Invite = mongoose.model('Invite', inviteSchema);
module.exports = Invite;