const express=require('express');
const router=express.Router();
const {authenticateJWT}=require('../services/authentication')

const {sendotp,verifyotp,username}=require('../controllers/usercontroller');
router.use(express.json());

router.post('/send-otp',sendotp);
router.post('/verify-otp',verifyotp);
router.get('/username',authenticateJWT,username);
module.exports=router;