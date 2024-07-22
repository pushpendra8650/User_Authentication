const crypto = require('crypto');

const generateOTP = (length) => {
  const otp = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  return otp.toUpperCase();
};

module.exports = generateOTP;
