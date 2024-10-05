const otpgenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const OTPmodel=require('../models/otpModel');
const otpModel = require('../models/otpModel');

const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingSSID=process.env.MESSAGE_SSID;
const client = twilio(accountSID, authToken);

const generateToken = (phoneNumber) => {
    return jwt.sign({ phoneNumber }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.sendotp=async(req,res)=>{
    try
    {
        const { phoneNumber, username } = req.body;
        const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

        await client.messages
        .create(
            {
                messagingServiceSid: messagingSSID,
                to: phoneNumber,
                body:`Your OTP is ${otp}. It will expire in 5 minutes.`
            })
        .then(message => console.log(message.sid));

        let otpRecord = await otpModel.findOne({ phoneNumber: phoneNumber });

        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.otpExpiration = otpExpiration;
            otpRecord.isVerified = false;
            otpRecord.createdAt = new Date();
        } else {
            otpRecord = new otpModel({
                phoneNumber: phoneNumber,
                otp: otp,
                otpExpiration: otpExpiration,
                username: username
            });
        }

        await otpRecord.save();

        return res.status(200).json({
            success: true,
            msg: 'otp sent successfully!!!'
        });
    }
    catch(error)
    {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

exports.verifyotp=async(req,res)=>{
    try
    {
        const { phoneNumber, otp } = req.body;

        const otpRecord = await otpModel.findOne({ phoneNumber: phoneNumber }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                msg: 'No User found !'
            });
        }

        if (otpRecord.isVerified) {
            return res.status(400).json({
                success: false,
                msg: 'This OTP has already been verified.'
            });
        }

        if (otpRecord.otpExpiration < new Date()) {
            return res.status(400).json({
                success: false,
                msg: 'OTP has expired. Please request a new one.'
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid OTP. Please try again.'
            });
        }

        otpRecord.isVerified = true;
        await otpRecord.save();

        const token = generateToken(phoneNumber);

        return res.status(200).json({
            success: true,
            msg: 'OTP verified successfully!',
            token: token
        });
    }
    catch(error)
    {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

exports.username=async(req,res)=>{
    try
    {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                msg: 'Access Denied. No token provided.'
            });
        }
    
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const phoneNumber = decoded.phoneNumber;

        const otpRecord = await otpModel.findOne({ phoneNumber: phoneNumber });

        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                msg: 'No user found with this phone number.'
            });
        }

        return res.status(200).json({
            success: true,
            username: otpRecord.username
        });
    }
    catch(error)
    {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}