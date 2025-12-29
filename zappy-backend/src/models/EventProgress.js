// Event progress model
// ============================================
const mongoose = require('mongoose');

const eventProgressSchema = new mongoose.Schema(
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
    progressType: {
      type: String,
      enum: ['pre_setup', 'post_setup'],
      required: true,
    },
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
eventProgressSchema.index({ eventId: 1, progressType: 1 });

module.exports = mongoose.model('EventProgress', eventProgressSchema);