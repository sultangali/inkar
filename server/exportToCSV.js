import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Booking from './models/Booking.js';
import Transaction from './models/Transaction.js';
import Workspace from './models/Workspace.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to convert array to CSV
const arrayToCSV = (data, headers) => {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

const exportToCSV = async () => {
  try {
    await connectDB();

    console.log('📊 Starting data export to CSV...\n');

    // Create exports directory
    const exportDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // 1. Export Revenue Trends (Daily)
    console.log('1️⃣ Exporting revenue trends...');
    const revenueTrends = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          processedAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$processedAt' } },
          revenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueData = revenueTrends.map(item => ({
      date: item._id,
      revenue: item.revenue,
      transactionCount: item.transactionCount
    }));

    fs.writeFileSync(
      path.join(exportDir, 'revenue_trends.csv'),
      arrayToCSV(revenueData, ['date', 'revenue', 'transactionCount'])
    );
    console.log(`   ✓ Exported ${revenueData.length} rows to revenue_trends.csv`);

    // 2. Export Workspace Popularity
    console.log('2️⃣ Exporting workspace popularity...');
    const workspacePopularity = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
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
          workspaceName: '$workspace.name',
          workspaceType: '$workspace.type',
          bookingCount: 1,
          totalRevenue: 1,
          totalHours: 1,
          avgRevenuePerBooking: { $divide: ['$totalRevenue', '$bookingCount'] }
        }
      },
      { $sort: { bookingCount: -1 } }
    ]);

    const workspaceData = workspacePopularity.map(item => ({
      workspaceName: item.workspaceName,
      workspaceType: item.workspaceType,
      bookingCount: item.bookingCount,
      totalRevenue: item.totalRevenue,
      totalHours: item.totalHours,
      avgRevenuePerBooking: Math.round(item.avgRevenuePerBooking)
    }));

    fs.writeFileSync(
      path.join(exportDir, 'workspace_popularity.csv'),
      arrayToCSV(workspaceData, ['workspaceName', 'workspaceType', 'bookingCount', 'totalRevenue', 'totalHours', 'avgRevenuePerBooking'])
    );
    console.log(`   ✓ Exported ${workspaceData.length} rows to workspace_popularity.csv`);

    // 3. Export Revenue by Type
    console.log('3️⃣ Exporting revenue by workspace type...');
    const revenueByType = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
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

    const typeData = revenueByType.map(item => ({
      workspaceType: item._id,
      totalRevenue: item.totalRevenue,
      bookingCount: item.bookingCount,
      avgPrice: Math.round(item.avgPrice)
    }));

    fs.writeFileSync(
      path.join(exportDir, 'revenue_by_type.csv'),
      arrayToCSV(typeData, ['workspaceType', 'totalRevenue', 'bookingCount', 'avgPrice'])
    );
    console.log(`   ✓ Exported ${typeData.length} rows to revenue_by_type.csv`);

    // 4. Export Payment Methods Distribution
    console.log('4️⃣ Exporting payment methods distribution...');
    const paymentMethods = await Transaction.aggregate([
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

    const paymentData = paymentMethods.map(item => ({
      paymentMethod: item._id,
      transactionCount: item.count,
      totalAmount: item.totalAmount,
      avgAmount: Math.round(item.totalAmount / item.count)
    }));

    fs.writeFileSync(
      path.join(exportDir, 'payment_methods.csv'),
      arrayToCSV(paymentData, ['paymentMethod', 'transactionCount', 'totalAmount', 'avgAmount'])
    );
    console.log(`   ✓ Exported ${paymentData.length} rows to payment_methods.csv`);

    // 5. Export Booking Trends (Last 30 days)
    console.log('5️⃣ Exporting booking trends...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
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

    // Transform data
    const trendMap = {};
    bookingTrends.forEach(item => {
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

    const trendsData = Object.values(trendMap);

    fs.writeFileSync(
      path.join(exportDir, 'booking_trends.csv'),
      arrayToCSV(trendsData, ['date', 'pending', 'confirmed', 'cancelled', 'completed', 'total'])
    );
    console.log(`   ✓ Exported ${trendsData.length} rows to booking_trends.csv`);

    // 6. Export All Bookings (Detailed)
    console.log('6️⃣ Exporting detailed bookings...');
    const allBookings = await Booking.find()
      .populate('workspace', 'name type pricePerHour')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const bookingsData = allBookings.map(booking => ({
      bookingId: booking._id.toString(),
      userName: booking.user?.name || 'N/A',
      userEmail: booking.user?.email || 'N/A',
      workspaceName: booking.workspace?.name || 'N/A',
      workspaceType: booking.workspace?.type || 'N/A',
      startTime: new Date(booking.startTime).toISOString(),
      endTime: new Date(booking.endTime).toISOString(),
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: new Date(booking.createdAt).toISOString()
    }));

    fs.writeFileSync(
      path.join(exportDir, 'all_bookings.csv'),
      arrayToCSV(bookingsData, ['bookingId', 'userName', 'userEmail', 'workspaceName', 'workspaceType', 'startTime', 'endTime', 'totalHours', 'totalPrice', 'status', 'createdAt'])
    );
    console.log(`   ✓ Exported ${bookingsData.length} rows to all_bookings.csv`);

    // 7. Export All Transactions
    console.log('7️⃣ Exporting all transactions...');
    const allTransactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('booking')
      .sort({ createdAt: -1 })
      .lean();

    const transactionsData = allTransactions.map(txn => ({
      transactionId: txn._id.toString(),
      userName: txn.user?.name || 'N/A',
      userEmail: txn.user?.email || 'N/A',
      amount: txn.amount,
      paymentMethod: txn.paymentMethod,
      status: txn.status,
      processedAt: txn.processedAt ? new Date(txn.processedAt).toISOString() : 'N/A',
      createdAt: new Date(txn.createdAt).toISOString()
    }));

    fs.writeFileSync(
      path.join(exportDir, 'all_transactions.csv'),
      arrayToCSV(transactionsData, ['transactionId', 'userName', 'userEmail', 'amount', 'paymentMethod', 'status', 'processedAt', 'createdAt'])
    );
    console.log(`   ✓ Exported ${transactionsData.length} rows to all_transactions.csv`);

    // 8. Export User Statistics
    console.log('8️⃣ Exporting user statistics...');
    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'user',
          as: 'bookings'
        }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'user',
          as: 'transactions'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          totalBookings: { $size: '$bookings' },
          completedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                as: 'booking',
                cond: { $eq: ['$$booking.status', 'completed'] }
              }
            }
          },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$transactions',
                    as: 'txn',
                    cond: { $eq: ['$$txn.status', 'success'] }
                  }
                },
                as: 'txn',
                in: '$$txn.amount'
              }
            }
          },
          createdAt: 1
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    const userData = userStats.map(user => ({
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      totalBookings: user.totalBookings,
      completedBookings: user.completedBookings,
      totalSpent: user.totalSpent,
      avgSpentPerBooking: user.completedBookings > 0 ? Math.round(user.totalSpent / user.completedBookings) : 0,
      memberSince: new Date(user.createdAt).toISOString().split('T')[0]
    }));

    fs.writeFileSync(
      path.join(exportDir, 'user_statistics.csv'),
      arrayToCSV(userData, ['userName', 'userEmail', 'role', 'totalBookings', 'completedBookings', 'totalSpent', 'avgSpentPerBooking', 'memberSince'])
    );
    console.log(`   ✓ Exported ${userData.length} rows to user_statistics.csv`);

    console.log('\n✅ Export completed successfully!');
    console.log(`\n📁 All CSV files saved to: ${exportDir}`);
    console.log('\n📊 Exported files:');
    console.log('   1. revenue_trends.csv - Daily revenue data');
    console.log('   2. workspace_popularity.csv - Most popular workspaces');
    console.log('   3. revenue_by_type.csv - Revenue breakdown by workspace type');
    console.log('   4. payment_methods.csv - Payment method distribution');
    console.log('   5. booking_trends.csv - Booking trends (last 30 days)');
    console.log('   6. all_bookings.csv - Complete booking details');
    console.log('   7. all_transactions.csv - All transaction records');
    console.log('   8. user_statistics.csv - User spending and activity');
    console.log('\n💡 You can now open these files in Excel to create custom charts!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  }
};

exportToCSV();
