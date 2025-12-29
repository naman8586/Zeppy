// Event management routes
// ============================================
const express = require('express');
const router = express.Router();
const {
  createEvent,
  checkIn,
  uploadProgress,
  getVendorEvents,
  getEventDetails,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Vendor only routes
router.post('/', authorize('vendor'), createEvent);
router.post('/check-in', authorize('vendor'), checkIn);
router.post('/progress', authorize('vendor'), uploadProgress);
router.get('/vendor', authorize('vendor'), getVendorEvents);

// Accessible by both vendor and customer
router.get('/:id', getEventDetails);

module.exports = router;
