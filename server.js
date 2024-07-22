const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();
connectDB();

const app = express();

// Rate limiting middleware for OTP requests
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many OTP requests from this IP, please try again later.',
});

app.use(express.json());
app.use('/api', otpRequestLimiter, authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
