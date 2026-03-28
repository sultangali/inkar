import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import Booking from './models/Booking.js';
import Transaction from './models/Transaction.js';
import connectDB from './config/db.js';

dotenv.config();

const seedBookings = async () => {
  try {
    await connectDB();

    console.log('Fetching users and workspaces...');
    const users = await User.find({ role: 'client' });
    const workspaces = await Workspace.find({ isActive: true });

    if (users.length === 0) {
      console.log('No client users found. Please run seed.js first.');
      process.exit(1);
    }

    if (workspaces.length === 0) {
      console.log('No workspaces found. Please run seed.js first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} client users and ${workspaces.length} workspaces`);

    // Clear existing bookings and transactions
    console.log('Clearing existing bookings and transactions...');
    await Booking.deleteMany({});
    await Transaction.deleteMany({});

    const now = new Date();
    const bookings = [];
    
    // Helper function to create booking
    const createBooking = async (user, daysOffset, status, workspaceIndex, hours, startHour) => {
      const startTime = new Date(now.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
      startTime.setHours(startHour, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
      
      // Set createdAt to be a few days before startTime for past bookings
      const createdAt = daysOffset < 0 
        ? new Date(startTime.getTime() - (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
      
      const workspace = workspaces[workspaceIndex % workspaces.length];
      
      const booking = await Booking.create({
        user: user._id,
        workspace: workspace._id,
        startTime,
        endTime,
        totalHours: hours,
        totalPrice: workspace.pricePerHour * hours,
        status,
        notes: status === 'completed' ? 'Completed session' : status === 'confirmed' ? 'Upcoming session' : 'Pending confirmation',
        createdAt,
        updatedAt: createdAt
      });

      // Create transaction
      const transactionStatus = status === 'completed' || status === 'confirmed' ? 'success' : 'pending';
      const paymentMethods = ['kaspi', 'card', 'cash'];
      
      await Transaction.create({
        booking: booking._id,
        user: user._id,
        amount: booking.totalPrice,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: transactionStatus,
        processedAt: transactionStatus === 'success' ? startTime : null,
        transactionId: transactionStatus === 'success' ? `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null,
        createdAt,
        updatedAt: createdAt
      });

      bookings.push(booking);
    };

    // Create bookings for last 60 days (completed)
    console.log('Creating past bookings (last 60 days)...');
    for (const user of users) {
      // Each user gets 25-30 past bookings over 60 days
      const numBookings = 25 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < numBookings; i++) {
        const daysAgo = -Math.floor(Math.random() * 60) - 1; // -1 to -60 days
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)]; // Random hours
        const startHour = 8 + Math.floor(Math.random() * 6); // 8am to 2pm
        
        await createBooking(user, daysAgo, 'completed', workspaceIndex, hours, startHour);
      }
    }

    // Create some cancelled bookings
    console.log('Creating cancelled bookings...');
    for (const user of users) {
      const numCancelled = 2 + Math.floor(Math.random() * 3); // 2-4 cancelled
      
      for (let i = 0; i < numCancelled; i++) {
        const daysAgo = -Math.floor(Math.random() * 30) - 1;
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4][Math.floor(Math.random() * 3)];
        const startHour = 9 + Math.floor(Math.random() * 5);
        
        await createBooking(user, daysAgo, 'cancelled', workspaceIndex, hours, startHour);
      }
    }

    // Create future bookings (confirmed)
    console.log('Creating future confirmed bookings...');
    for (const user of users) {
      const numFuture = 3 + Math.floor(Math.random() * 4); // 3-6 future bookings
      
      for (let i = 0; i < numFuture; i++) {
        const daysAhead = Math.floor(Math.random() * 30) + 1; // 1 to 30 days ahead
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
        const startHour = 9 + Math.floor(Math.random() * 4);
        
        await createBooking(user, daysAhead, 'confirmed', workspaceIndex, hours, startHour);
      }
    }

    // Create pending bookings (awaiting confirmation)
    console.log('Creating pending bookings...');
    for (const user of users) {
      const numPending = 1 + Math.floor(Math.random() * 3); // 1-3 pending
      
      for (let i = 0; i < numPending; i++) {
        const daysAhead = Math.floor(Math.random() * 14) + 1; // 1 to 14 days ahead
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const startHour = 10 + Math.floor(Math.random() * 4);
        
        await createBooking(user, daysAhead, 'pending', workspaceIndex, hours, startHour);
      }
    }

    console.log(`\n✅ Created ${bookings.length} bookings with transactions!`);
    console.log(`\nBookings per user: ~${Math.floor(bookings.length / users.length)}`);
    console.log('Distribution:');
    console.log('- Past completed: ~25-30 per user');
    console.log('- Cancelled: ~2-4 per user');
    console.log('- Future confirmed: ~3-6 per user');
    console.log('- Pending: ~1-3 per user');
    console.log('\nTotal per user: ~31-43 bookings');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
};

seedBookings();
