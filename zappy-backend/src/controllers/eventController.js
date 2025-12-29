// Event management controller
// ============================================
const Event = require('../models/Event');
const CheckIn = require('../models/CheckIn');
const EventProgress = require('../models/EventProgress');

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Vendor only)
const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      customerId,
      customerEmail,
      customerPhone,
      address,
      latitude,
      longitude,
    } = req.body;

    const event = await Event.create({
      eventName,
      eventDate: new Date(eventDate),
      vendorId: req.user._id,
      customerId,
      customerEmail,
      customerPhone,
      location: {
        address,
        coordinates: { latitude, longitude },
      },
      timeline: {
        scheduledTime: new Date(eventDate),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
    });
  }
};

// @desc    Check in to event
// @route   POST /api/events/check-in
// @access  Private (Vendor only)
const checkIn = async (req, res) => {
  try {
    const { eventId, latitude, longitude, photoUrl } = req.body;

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
        message: 'Not authorized for this event',
      });
    }

    // Check if already checked in
    const existingCheckIn = await CheckIn.findOne({ eventId });
    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for this event',
      });
    }

    // Create check-in
    const checkIn = await CheckIn.create({
      eventId,
      vendorId: req.user._id,
      checkInPhoto: photoUrl,
      location: { latitude, longitude },
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    // Update event
    event.status = 'checked_in';
    event.timeline.checkInTime = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      data: { checkIn, event },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: error.message,
    });
  }
};

// @desc    Upload progress
// @route   POST /api/events/progress
// @access  Private (Vendor only)
const uploadProgress = async (req, res) => {
  try {
    const { eventId, progressType, photoUrls, notes } = req.body;

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
        message: 'Not authorized for this event',
      });
    }

    // Create progress record
    const progress = await EventProgress.create({
      eventId,
      vendorId: req.user._id,
      progressType,
      photos: photoUrls.map((url) => ({ url, uploadedAt: new Date() })),
      notes,
    });

    res.json({
      success: true,
      message: 'Progress uploaded successfully',
      data: progress,
    });
  } catch (error) {
    console.error('Upload progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading progress',
      error: error.message,
    });
  }
};

// @desc    Get vendor events
// @route   GET /api/events/vendor
// @access  Private (Vendor only)
const getVendorEvents = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { vendorId: req.user._id };
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .sort({ eventDate: -1 })
      .populate('customerId', 'email profile');

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Get vendor events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

// @desc    Get event details
// @route   GET /api/events/:id
// @access  Private
const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('vendorId', 'email profile')
      .populate('customerId', 'email profile');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check access
    const hasAccess =
      event.vendorId._id.toString() === req.user._id.toString() ||
      event.customerId._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this event',
      });
    }

    // Get check-in and progress
    const checkIn = await CheckIn.findOne({ eventId: req.params.id });
    const progress = await EventProgress.find({ eventId: req.params.id });

    res.json({
      success: true,
      data: { event, checkIn, progress },
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event details',
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  checkIn,
  uploadProgress,
  getVendorEvents,
  getEventDetails,
};