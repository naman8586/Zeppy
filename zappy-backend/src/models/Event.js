// Event model
// ============================================
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
    },
    status: {
      type: String,
      enum: ['pending', 'checked_in', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    timeline: {
      scheduledTime: Date,
      checkInTime: Date,
      startTime: Date,
      completionTime: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
eventSchema.index({ vendorId: 1, eventDate: -1 });
eventSchema.index({ customerId: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
