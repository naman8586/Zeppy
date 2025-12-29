// Media upload routes
// ============================================
const express = require('express');
const router = express.Router();
const {
  uploadCheckInPhoto,
  uploadProgressPhotos,
  deleteFile,
} = require('../controllers/mediaController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication and vendor role
router.use(protect);
router.use(authorize('vendor'));

// Upload routes
router.post('/upload/check-in', upload.single('photo'), uploadCheckInPhoto);
router.post('/upload/progress', upload.array('photos', 10), uploadProgressPhotos);

// Delete route
router.delete('/:filename', deleteFile);

module.exports = router;