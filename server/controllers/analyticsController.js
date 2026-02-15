import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

// @desc    Get KPI metrics
// @route   GET /api/analytics/kpi
// @access  Private (Admin/Moderator)
export const getKPI = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total revenue (all time)
    const totalRevenueResult = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Monthly revenue
    const monthlyRevenueResult = await Transaction.aggregate([
      { 
        $match: { 
          status: 'success',
          processedAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    // Yearly revenue
    const yearlyRevenueResult = await Transaction.aggregate([
      { 
        $match: { 
          status: 'success',
          processedAt: { $gte: startOfYear }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const yearlyRevenue = yearlyRevenueResult[0]?.total || 0;

    // Total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Active bookings
    const activeBookings = await Booking.countDocuments({
      status: 'confirmed',
      endTime: { $gte: now }
    });

    // Average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'client' });

    // Monthly bookings
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Workspace utilization
    const totalWorkspaces = await Workspace.countDocuments({ isActive: true });
    const occupiedWorkspaces = await Booking.countDocuments({
      status: 'confirmed',
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    const utilizationRate = totalWorkspaces > 0 ? (occupiedWorkspaces / totalWorkspaces) * 100 : 0;

    res.status(200).json({
      success: true,
      kpi: {
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        totalBookings,
        activeBookings,
        monthlyBookings,
        avgBookingValue,
        totalCustomers,
        totalWorkspaces,
        occupiedWorkspaces,
        utilizationRate: utilizationRate.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue data over time
// @route   GET /api/analytics/revenue
// @access  Private (Admin/Moderator)
export const getRevenueData = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$processedAt' } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-W%V', date: '$processedAt' } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$processedAt' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$processedAt' } };
    }

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          processedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: revenueData.map(item => ({
        date: item._id,
        revenue: item.revenue,
        transactionCount: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get workspace popularity data
// @route   GET /api/analytics/workspace-popularity
// @access  Private (Admin/Moderator)
export const getWorkspacePopularity = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchFilter = { status: { $in: ['confirmed', 'completed'] } };
    
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    const popularityData = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$workspace',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          totalHours: { $sum: '$totalHours' }
        }
      },
      {
        $lookup: {
          from: 'workspaces',
          localField: '_id',
          foreignField: '_id',
          as: 'workspace'
        }
      },
      { $unwind: '$workspace' },
      {
        $project: {
          workspaceId: '$_id',
          workspaceName: '$workspace.name',
          workspaceType: '$workspace.type',
          bookingCount: 1,
          totalRevenue: 1,
          totalHours: 1
        }
      },
      { $sort: { bookingCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: popularityData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by workspace type
// @route   GET /api/analytics/revenue-by-type
// @access  Private (Admin/Moderator)
export const getRevenueByType = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchFilter = { status: { $in: ['confirmed', 'completed'] } };
    
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    const revenueByType = await Booking.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspace',
          foreignField: '_id',
          as: 'workspace'
        }
      },
      { $unwind: '$workspace' },
      {
        $group: {
          _id: '$workspace.type',
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
          avgPrice: { $avg: '$totalPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: revenueByType.map(item => ({
        type: item._id,
        totalRevenue: item.totalRevenue,
        bookingCount: item.bookingCount,
        avgPrice: item.avgPrice
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment method distribution
// @route   GET /api/analytics/payment-methods
// @access  Private (Admin/Moderator)
export const getPaymentMethodDistribution = async (req, res, next) => {
  try {
    const distribution = await Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: distribution.map(item => ({
        paymentMethod: item._id,
        count: item.count,
        totalAmount: item.totalAmount
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking trends
// @route   GET /api/analytics/booking-trends
// @access  Private (Admin/Moderator)
export const getBookingTrends = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const trends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Transform data for easier consumption
    const trendMap = {};
    trends.forEach(item => {
      if (!trendMap[item._id.date]) {
        trendMap[item._id.date] = {
          date: item._id.date,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          total: 0
        };
      }
      trendMap[item._id.date][item._id.status] = item.count;
      trendMap[item._id.date].total += item.count;
    });

    res.status(200).json({
      success: true,
      data: Object.values(trendMap)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/analytics/users
// @access  Private (Admin/Moderator)
export const getUserStatistics = async (req, res, next) => {
  try {
    // User role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top customers by spending
    const topCustomers = await Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          transactionCount: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // New users trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      roleDistribution,
      topCustomers,
      newUsersTrend: newUsersTrend.map(item => ({
        date: item._id,
        newUsers: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

