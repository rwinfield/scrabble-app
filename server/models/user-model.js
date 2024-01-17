const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        trim: true 
    },
    username: {
        type: String,
        // unique: true,
        trim: true
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;