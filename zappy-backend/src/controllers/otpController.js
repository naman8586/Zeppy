// OTP controller
// ============================================
const Otp = require('../models/Otp');
const Event = require('../models/Event');
const { generateOTP, sendOTP, getOTPExpiry } = require('../utils/otp');

// @desc    Generate OTP
// @route   POST /api/otp/generate
// @access  Private (Vendor only)
const generateOtp = async (req, res) => {
  try {
    const { eventId, otpType } = req.body;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify vendor owns event
    if (event.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only vendor can trigger OTP',
      });
    }

    // Check event status
    if (otpType === 'event_start' && event.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Event must be checked in before generating start OTP',
      });
    }

    if (otpType === 'event_completion' && event.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Event must be in progress before generating completion OTP',
      });
    }

    // Invalidate existing OTPs
    await Otp.updateMany(
      {
        eventId,
        otpType,
        isVerified: false,
      },
      { expiresAt: new Date() }
    );

    // Generate new OTP
    const otpCode = generateOTP(parseInt(process.env.OTP_LENGTH) || 6);
    const expiresAt = getOTPExpiry();

    const otp = await Otp.create({
      eventId,
      userId: event.customerId,
      otpCode,
      otpType,
      expiresAt,
    });

    // Send OTP
    await sendOTP(event.customerPhone, event.customerEmail, otpCode);

    res.json({
      success: true,
      message: 'OTP sent to customer',
      data: {
        otpId: otp._id,
        expiresAt: otp.expiresAt,
        // ONLY FOR DEVELOPMENT
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined,
      },
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating OTP',
      error: error.message,
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Private
const verifyOtp = async (req, res) => {
  try {
    const { eventId, otpCode, otpType } = req.body;

    // Find OTP
    const otp = await Otp.findOne({
      eventId,
      otpType,
      isVerified: false,
    });

    if (!otp) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found or already verified',
      });
    }

    // Check expiry
    if (new Date() > otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Check attempts
    if (otp.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded',
      });
    }

    // Verify OTP
    if (otp.otpCode !== otpCode) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otp.attempts} attempts remaining`,
      });
    }

    // Mark as verified
    otp.isVerified = true;
    otp.verifiedAt = new Date();
    await otp.save();

    // Update event status
    const event = await Event.findById(eventId);
    if (otpType === 'event_start') {
      event.status = 'in_progress';
      event.timeline.startTime = new Date();
    } else if (otpType === 'event_completion') {
      event.status = 'completed';
      event.timeline.completionTime = new Date();
    }
    await event.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: { event },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// @desc    Get OTP status
// @route   GET /api/otp/status
// @access  Private
const getOtpStatus = async (req, res) => {
  try {
    const { eventId, otpType } = req.query;

    const otp = await Otp.findOne({ eventId, otpType }).sort({ createdAt: -1 });

    if (!otp) {
      return res.json({
        success: true,
        data: { exists: false },
      });
    }

    res.json({
      success: true,
      data: {
        exists: true,
        isVerified: otp.isVerified,
        expiresAt: otp.expiresAt,
        isExpired: new Date() > otp.expiresAt,
        attempts: otp.attempts,
      },
    });
  } catch (error) {
    console.error('Get OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching OTP status',
      error: error.message,
    });
  }
};

module.exports = {
  generateOtp,
  verifyOtp,
  getOtpStatus,
};
