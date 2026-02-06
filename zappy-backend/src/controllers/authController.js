// Authentication controller
// ============================================
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/token');

/* ======================================================
   REGISTER
====================================================== */
const register = async (req, res) => {
  try {
    let { email, password, role, profile } = req.body;

    email = email?.toLowerCase().trim();
    profile = profile || {};

    if (!email || !password || !profile.name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'vendor',
      profile: {
        name: profile.name,
        phone: profile.phone || '',
      },
    });

    const token = generateToken(user._id); // ✅ CORRECT

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

/* ======================================================
   LOGIN (FINAL FIX)
====================================================== */
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    email = email.toLowerCase().trim();

    // 🔐 MUST explicitly include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ✅ FIX: pass user._id ONLY
    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/* ======================================================
   PROFILE
====================================================== */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // ✅ _id

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
