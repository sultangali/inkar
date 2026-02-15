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
        pricePerHour: 1500,
        capacity: 1,
        description: 'Flexible hot desk in open coworking area',
        amenities: ['WiFi', 'Power outlet', 'Natural light'],
        floor: 1,
        isActive: true
      },
      {
        name: 'Hot Desk 2',
        type: 'hot_desk',
        pricePerHour: 1500,
        capacity: 1,
        description: 'Flexible hot desk with window view',
        amenities: ['WiFi', 'Power outlet', 'Window view'],
        floor: 1,
        isActive: true
      },
      {
        name: 'Dedicated Desk A1',
        type: 'desk',
        pricePerHour: 2500,
        capacity: 1,
        description: 'Your own dedicated workspace',
        amenities: ['WiFi', 'Lockable drawer', 'Monitor', 'Ergonomic chair'],
        floor: 2,
        isActive: true
      },
      {
        name: 'Dedicated Desk A2',
        type: 'desk',
        pricePerHour: 2500,
        capacity: 1,
        description: 'Dedicated desk in quiet zone',
        amenities: ['WiFi', 'Lockable drawer', 'Monitor', 'Quiet zone'],
        floor: 2,
        isActive: true
      },
      {
        name: 'Meeting Room Alpha',
        type: 'meeting_room',
        pricePerHour: 5000,
        capacity: 8,
        description: 'Professional meeting room with AV equipment',
        amenities: ['WiFi', 'TV Screen', 'Whiteboard', 'Video conferencing'],
        floor: 3,
        isActive: true
      },
      {
        name: 'Meeting Room Beta',
        type: 'meeting_room',
        pricePerHour: 4000,
        capacity: 6,
        description: 'Cozy meeting room for small groups',
        amenities: ['WiFi', 'Monitor', 'Whiteboard'],
        floor: 3,
        isActive: true
      },
      {
        name: 'Private Office 1',
        type: 'private_office',
        pricePerHour: 8000,
        capacity: 4,
        description: 'Fully private office space',
        amenities: ['WiFi', 'Desks', 'Chairs', 'Storage', 'Door lock'],
        floor: 4,
        isActive: true
      },
      {
        name: 'Private Office 2',
        type: 'private_office',
        pricePerHour: 10000,
        capacity: 6,
        description: 'Spacious private office with view',
        amenities: ['WiFi', 'Desks', 'Chairs', 'Storage', 'Window view', 'Meeting table'],
        floor: 4,
        isActive: true
      }
    ]);

    console.log(`Created ${workspaces.length} workspaces`);

    // Create some bookings
    console.log('Creating sample bookings...');
    const now = new Date();
    const bookings = [];

    // Past bookings (completed)
    for (let i = 1; i <= 10; i++) {
      const startTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      
      const workspace = workspaces[i % workspaces.length];
      const user = users[3 + (i % 2)]; // Rotate between John (index 3) and Jane (index 4)
      
      const booking = await Booking.create({
        user: user._id,
        workspace: workspace._id,
        startTime,
        endTime,
        totalHours: 4,
        totalPrice: workspace.pricePerHour * 4,
        status: 'completed',
        notes: `Booking ${i}`
      });

      // Create corresponding transaction
      await Transaction.create({
        booking: booking._id,
        user: user._id,
        amount: booking.totalPrice,
        paymentMethod: i % 2 === 0 ? 'kaspi' : 'card',
        status: 'success',
        processedAt: startTime,
        transactionId: `TXN-${Date.now()}-${booking._id}`
      });

      bookings.push(booking);
    }

    // Future bookings (confirmed)
    for (let i = 1; i <= 5; i++) {
      const startTime = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
      startTime.setHours(10, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours
      
      const workspace = workspaces[i % workspaces.length];
      const user = users[3 + (i % 2)]; // Rotate between John (index 3) and Jane (index 4)
      
      const booking = await Booking.create({
        user: user._id,
        workspace: workspace._id,
        startTime,
        endTime,
        totalHours: 3,
        totalPrice: workspace.pricePerHour * 3,
        status: 'confirmed',
        notes: `Future booking ${i}`
      });

      await Transaction.create({
        booking: booking._id,
        user: user._id,
        amount: booking.totalPrice,
        paymentMethod: 'kaspi',
        status: 'success',
        processedAt: now,
        transactionId: `TXN-${Date.now()}-${booking._id}`
      });

      bookings.push(booking);
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

