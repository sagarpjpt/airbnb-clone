const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: String,
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    userType: {
        type: String,
        enum: ['guest', 'host'],
        default: 'guest'
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home'
    }]
})

module.exports = mongoose.model('User', userSchema);