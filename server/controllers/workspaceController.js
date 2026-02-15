import Workspace from '../models/Workspace.js';

// @desc    Get all workspaces
// @route   GET /api/workspaces
// @access  Public
export const getWorkspaces = async (req, res, next) => {
  try {
    const { type, minCapacity, maxPrice, isActive } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (minCapacity) filter.capacity = { $gte: parseInt(minCapacity) };
    if (maxPrice) filter.pricePerHour = { $lte: parseFloat(maxPrice) };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const workspaces = await Workspace.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workspace
// @route   GET /api/workspaces/:id
// @access  Public
export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    res.status(200).json({
      success: true,
      workspace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workspace
// @route   POST /api/workspaces
// @access  Private (Admin/Moderator)
export const createWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.create(req.body);

    res.status(201).json({
      success: true,
      workspace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private (Admin/Moderator)
export const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    res.status(200).json({
      success: true,
      workspace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (Admin)
export const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByIdAndDelete(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workspace availability
// @route   GET /api/workspaces/:id/availability
// @access  Public
export const getWorkspaceAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Import Booking model here to avoid circular dependency
    const Booking = (await import('../models/Booking.js')).default;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      workspace: req.params.id,
      status: { $in: ['confirmed', 'pending'] },
      startTime: { $gte: startOfDay },
      endTime: { $lte: endOfDay }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      workspace: {
        id: workspace._id,
        name: workspace.name,
        type: workspace.type
      },
      bookings: bookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime
      }))
    });
  } catch (error) {
    next(error);
  }
};

