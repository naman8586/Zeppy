// Media upload controller
// ============================================
const fs = require('fs');
const path = require('path');

// @desc    Upload check-in photo
// @route   POST /api/media/upload/check-in
// @access  Private (Vendor only)
const uploadCheckInPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/check-ins/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Check-in photo uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload check-in photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: error.message,
    });
  }
};

// @desc    Upload progress photos
// @route   POST /api/media/upload/progress
// @access  Private (Vendor only)
const uploadProgressPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/progress/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      success: true,
      message: `${req.files.length} photo(s) uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload progress photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photos',
      error: error.message,
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/media/:filename
// @access  Private (Vendor only)
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadPath = process.env.UPLOAD_DEST || './uploads';
    const filePath = path.join(uploadPath, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: 'File deleted successfully',
      });
    }

    res.status(404).json({
      success: false,
      message: 'File not found',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
};

module.exports = {
  uploadCheckInPhoto,
  uploadProgressPhotos,
  deleteFile,
};