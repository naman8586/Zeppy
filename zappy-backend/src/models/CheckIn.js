// Check-in model
// ============================================
const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkInPhoto: {
      type: String,
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
checkInSchema.index({ eventId: 1 });
checkInSchema.index({ vendorId: 1, timestamp: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);
