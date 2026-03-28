import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Booking.deleteMany({});
    await Transaction.deleteMany({});

    // Create users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@inkar.kz',
        password: 'admin123',
        role: 'admin',
        phone: '+77001234567',
        company: 'Inkar Ltd'
      },
      {
        name: 'Moderator User',
        email: 'moderator@inkar.kz',
        password: 'moderator123',
        role: 'moderator',
        phone: '+77001234568'
      },
      {
        name: 'Employee User',
        email: 'employee@inkar.kz',
        password: 'employee123',
        role: 'employee',
        phone: '+77001234571',
        company: 'Inkar Ltd'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'client123',
        role: 'client',
        phone: '+77001234569',
        company: 'Tech Startup'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'client123',
        role: 'client',
        phone: '+77001234570',
        company: 'Design Agency'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create workspaces
    console.log('Creating workspaces...');
    const workspaces = await Workspace.create([
      {
        name: 'Hot Desk 1',
        type: 'hot_desk',
        pricePerHour: 400,
        capacity: 1,
        description: 'Flexible hot desk in open coworking area',
        amenities: ['WiFi', 'Power outlet', 'Natural light'],
        floor: 1,
        isActive: true
      },
      {
        name: 'Hot Desk 2',
        type: 'hot_desk',
        pricePerHour: 400,
        capacity: 1,
        description: 'Flexible hot desk with window view',
        amenities: ['WiFi', 'Power outlet', 'Window view'],
        floor: 1,
        isActive: true
      },
      {
        name: 'Dedicated Desk A1',
        type: 'desk',
        pricePerHour: 500,
        capacity: 1,
        description: 'Your own dedicated workspace',
        amenities: ['WiFi', 'Lockable drawer', 'Monitor', 'Ergonomic chair'],
        floor: 2,
        isActive: true
      },
      {
        name: 'Dedicated Desk A2',
        type: 'desk',
        pricePerHour: 500,
        capacity: 1,
        description: 'Dedicated desk in quiet zone',
        amenities: ['WiFi', 'Lockable drawer', 'Monitor', 'Quiet zone'],
        floor: 2,
        isActive: true
      },
      {
        name: 'Meeting Room Alpha',
        type: 'meeting_room',
        pricePerHour: 1500,
        capacity: 8,
        description: 'Professional meeting room with AV equipment',
        amenities: ['WiFi', 'TV Screen', 'Whiteboard', 'Video conferencing'],
        floor: 3,
        isActive: true
      },
      {
        name: 'Meeting Room Beta',
        type: 'meeting_room',
        pricePerHour: 1200,
        capacity: 6,
        description: 'Cozy meeting room for small groups',
        amenities: ['WiFi', 'Monitor', 'Whiteboard'],
        floor: 3,
        isActive: true
      },
      {
        name: 'Private Office 1',
        type: 'private_office',
        pricePerHour: 2500,
        capacity: 4,
        description: 'Fully private office space',
        amenities: ['WiFi', 'Desks', 'Chairs', 'Storage', 'Door lock'],
        floor: 4,
        isActive: true
      },
      {
        name: 'Private Office 2',
        type: 'private_office',
        pricePerHour: 3000,
        capacity: 6,
        description: 'Spacious private office with view',
        amenities: ['WiFi', 'Desks', 'Chairs', 'Storage', 'Window view', 'Meeting table'],
        floor: 4,
        isActive: true
      }
    ]);

    console.log(`Created ${workspaces.length} workspaces`);

    // Create diverse bookings for analytics
    console.log('Creating sample bookings...');
    const now = new Date();
    const bookings = [];
    
    // Client users only (skip admin, moderator, employee)
    const clientUsers = users.slice(3); // John and Jane
    
    // Helper function to create random booking
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
    for (const user of clientUsers) {
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
    for (const user of clientUsers) {
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
    for (const user of clientUsers) {
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
    for (const user of clientUsers) {
      const numPending = 1 + Math.floor(Math.random() * 3); // 1-3 pending
      
      for (let i = 0; i < numPending; i++) {
        const daysAhead = Math.floor(Math.random() * 14) + 1; // 1 to 14 days ahead
        const workspaceIndex = Math.floor(Math.random() * workspaces.length);
        const hours = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const startHour = 10 + Math.floor(Math.random() * 4);
        
        await createBooking(user, daysAhead, 'pending', workspaceIndex, hours, startHour);
      }
    }

    console.log(`Created ${bookings.length} bookings with transactions`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Admin: admin@inkar.kz / admin123');
    console.log('Moderator: moderator@inkar.kz / moderator123');
    console.log('Employee: employee@inkar.kz / employee123');
    console.log('Client: john@example.com / client123');
    console.log('Client: jane@example.com / client123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

