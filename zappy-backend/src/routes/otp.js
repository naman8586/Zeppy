// OTP routes
// ============================================
const express = require('express');
const router = express.Router();
const {
  generateOtp,
  verifyOtp,
  getOtpStatus,
} = require('../controllers/otpController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Vendor only - generate OTP
router.post('/generate', authorize('vendor'), generateOtp);

// Any authenticated user can verify OTP
router.post('/verify', verifyOtp);

// Check OTP status
router.get('/status', getOtpStatus);

module.exports = router;
