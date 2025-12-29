// User model
// ============================================
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['vendor', 'customer', 'admin'],
      default: 'vendor',
      required: true,
    },
    profile: {
      name: {
        type: String,
        required: true,
      },
      phone: String,
      avatar: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);