import Booking from '../models/Booking.js';
import Workspace from '../models/Workspace.js';
import Transaction from '../models/Transaction.js';
import { validateBookingTime } from '../utils/validation.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { workspace, startTime, endTime, notes } = req.body;

    // Validation
    if (!workspace || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workspace, start time, and end time'
      });
    }

    // Validate booking time
    const timeValidation = validateBookingTime(startTime, endTime);
    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.error
      });
    }

    // Check if workspace exists
    const workspaceData = await Workspace.findById(workspace);
    if (!workspaceData) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    if (!workspaceData.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Workspace is not available'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      workspace,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Workspace is already booked for this time slot'
      });
    }

    // Calculate total price with discount
    const totalHours = timeValidation.hours;
    const basePrice = totalHours * workspaceData.pricePerHour;
    const discount = req.body.discount || 0;
    const discountAmount = (basePrice * discount) / 100;
    const totalPrice = basePrice - discountAmount;

    // Create booking with pending status - requires employee/admin/moderator confirmation
    const booking = await Booking.create({
      user: req.user.id,
      workspace,
      startTime,
      endTime,
      totalHours,
      totalPrice,
      discount,
      notes,
      status: 'pending' // Always pending by default - requires manual confirmation
    });

    // Create transaction record with pending status
    const transaction = await Transaction.create({
      booking: booking._id,
      user: req.user.id,
      amount: totalPrice,
      paymentMethod: req.body.paymentMethod || 'kaspi',
      status: 'pending' // Will be updated to 'success' when booking is confirmed
    });

    // Populate booking with workspace details
    await booking.populate('workspace');

    res.status(201).json({
      success: true,
      booking,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    const filter = { user: req.user.id };
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('workspace')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Moderator/Employee)
// @route   GET /api/bookings/all
// @access  Private (Admin/Moderator/Employee)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, workspace, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (workspace) filter.workspace = workspace;
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('workspace')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('workspace')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user._id.toString() !== req.user.id && !['admin', 'moderator', 'employee'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id && !['admin', 'moderator', 'employee'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.status} booking`
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.reason || 'User cancelled';
    await booking.save();

    // Update transaction if exists
    const transaction = await Transaction.findOne({ booking: booking._id });
    if (transaction && transaction.status === 'success') {
      transaction.status = 'refunded';
      transaction.refundedAt = new Date();
      transaction.refundAmount = transaction.amount;
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking (Admin/Moderator/Employee)
// @route   PATCH /api/bookings/:id/confirm
// @access  Private (Admin/Moderator/Employee)
export const confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm ${booking.status} booking`
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Update transaction
    const transaction = await Transaction.findOne({ booking: booking._id });
    if (transaction) {
      transaction.status = 'success';
      transaction.processedAt = new Date();
      transaction.transactionId = `TXN-${Date.now()}-${booking._id}`;
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete booking (Admin/Moderator/Employee)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Admin/Moderator/Employee)
export const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete ${booking.status} booking`
      });
    }

    booking.status = 'completed';
    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

