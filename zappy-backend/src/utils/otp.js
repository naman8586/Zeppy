// OTP utility functions
// ============================================

// Generate random OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

// Mock send OTP via SMS/Email
const sendOTP = async (phone, email, otpCode) => {
  // In production, integrate with Twilio/SendGrid
  console.log(`
  ==========================================
  📧 MOCK OTP NOTIFICATION
  ==========================================
  To: ${email}
  Phone: ${phone}
  OTP Code: ${otpCode}
  ==========================================
  `);
  
  return true;
};

// Calculate OTP expiry time
const getOTPExpiry = () => {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  return expiresAt;
};

module.exports = {
  generateOTP,
  sendOTP,
  getOTPExpiry,
};