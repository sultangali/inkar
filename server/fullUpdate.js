import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from './models/Workspace.js';
import Booking from './models/Booking.js';
import Transaction from './models/Transaction.js';
import connectDB from './config/db.js';

dotenv.config();

const fullUpdate = async () => {
  try {
    await connectDB();

    console.log('🔄 Starting full update...\n');

    // Step 1: Update workspace prices
    console.log('1️⃣ Updating workspace prices...');
    
    await Workspace.updateMany(
      { type: 'hot_desk' },
      { $set: { pricePerHour: 480 } }
    );
    console.log('   ✓ Hot desk: 480₸/hour');

    await Workspace.updateMany(
      { type: 'desk' },
      { $set: { pricePerHour: 480 } }
    );
    console.log('   ✓ Dedicated desk: 480₸/hour');

    const meetingRooms = await Workspace.find({ type: 'meeting_room' });
    for (const room of meetingRooms) {
      const newPrice = room.capacity >= 8 ? 1500 : 1200;
      room.pricePerHour = newPrice;
      await room.save();
    }
    console.log('   ✓ Meeting rooms: 1200-1500₸/hour');

    const privateOffices = await Workspace.find({ type: 'private_office' });
    for (const office of privateOffices) {
      const newPrice = office.capacity >= 6 ? 3000 : 2500;
      office.pricePerHour = newPrice;
      await office.save();
    }
    console.log('   ✓ Private offices: 2500-3000₸/hour\n');

    // Step 2: Delete old bookings and transactions
    console.log('2️⃣ Clearing old bookings and transactions...');
    await Booking.deleteMany({});
    await Transaction.deleteMany({});
    console.log('   ✓ Cleared all bookings and transactions\n');

    // Step 3: Recreate bookings with correct prices
    console.log('3️⃣ Creating new bookings with updated prices...');
    
    const User = (await import('./models/User.js')).default;
    const users = await User.find({ role: 'client' });
    const workspaces = await Workspace.find({ isActive: true });

    if (users.length === 0 || workspaces.length === 0) {
      console.log('   ⚠️  No users or workspaces found. Run seed.js first.');
      process.exit(1);
    }

    const now = new Date();
    let totalBookings = 0;

    const createBooking = async (user, daysOffset, status, workspaceIndex, hours, startHour) => {
      const startTime = new Date(now.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
      startTime.setHours(startHour, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
      
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

      totalBookings++;
    };

    // Create past bookings (60 days)
    for (const user of users) {
      const numBookings = 25 + Math.floor(Math.random() * 6);
      for (let i = 0; i < numBookings; i++) {
        const daysAgo = -Math.floor(Math.random() * 60) - 1;
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
        const startHour = 8 + Math.floor(Math.random() * 6);
        await createBooking(user, daysAgo, 'completed', workspaceIndex, hours, startHour);
      }
    }
    console.log(`   ✓ Created past bookings (completed)`);

    // Create cancelled bookings
    for (const user of users) {
      const numCancelled = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numCancelled; i++) {
        const daysAgo = -Math.floor(Math.random() * 30) - 1;
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4][Math.floor(Math.random() * 3)];
        const startHour = 9 + Math.floor(Math.random() * 5);
        await createBooking(user, daysAgo, 'cancelled', workspaceIndex, hours, startHour);
      }
    }
    console.log(`   ✓ Created cancelled bookings`);

    // Create future bookings
    for (const user of users) {
      const numFuture = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numFuture; i++) {
        const daysAhead = Math.floor(Math.random() * 30) + 1;
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
        const startHour = 9 + Math.floor(Math.random() * 4);
        await createBooking(user, daysAhead, 'confirmed', workspaceIndex, hours, startHour);
      }
    }
    console.log(`   ✓ Created future bookings (confirmed)`);

    // Create pending bookings
    for (const user of users) {
      const numPending = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numPending; i++) {
        const daysAhead = Math.floor(Math.random() * 14) + 1;
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const startHour = 10 + Math.floor(Math.random() * 4);
        await createBooking(user, daysAhead, 'pending', workspaceIndex, hours, startHour);
      }
    }
    console.log(`   ✓ Created pending bookings\n`);

    console.log('✅ Full update completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Total bookings created: ${totalBookings}`);
    console.log(`   - Bookings per user: ~${Math.floor(totalBookings / users.length)}`);
    console.log('\n💰 New pricing:');
    console.log('   - Hot desk: 480₸/hour (~3,840₸/day, ~84,480₸/month)');
    console.log('   - Dedicated desk: 480₸/hour (~3,840₸/day, ~84,480₸/month)');
    console.log('   - Meeting room: 1200-1500₸/hour');
    console.log('   - Private office: 2500-3000₸/hour');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during update:', error);
    process.exit(1);
  }
};

fullUpdate();
