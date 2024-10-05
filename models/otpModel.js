const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiration: {
        type: Date,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('OTP', otpSchema);;
