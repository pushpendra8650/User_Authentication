const express = require('express');
const { register, requestOtp, verifyOtp } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
