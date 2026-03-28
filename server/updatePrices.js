import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from './models/Workspace.js';
import connectDB from './config/db.js';

dotenv.config();

const updatePrices = async () => {
  try {
    await connectDB();

    console.log('Updating workspace prices...');

    // Update hot desks
    await Workspace.updateMany(
      { type: 'hot_desk' },
      { $set: { pricePerHour: 400 } }
    );
    console.log('✓ Updated hot desk prices to 400₸/hour');

    // Update dedicated desks
    await Workspace.updateMany(
      { type: 'desk' },
      { $set: { pricePerHour: 500 } }
    );
    console.log('✓ Updated dedicated desk prices to 500₸/hour');

    // Update meeting rooms
    const meetingRooms = await Workspace.find({ type: 'meeting_room' });
    for (const room of meetingRooms) {
      const newPrice = room.capacity >= 8 ? 1500 : 1200;
      room.pricePerHour = newPrice;
      await room.save();
    }
    console.log('✓ Updated meeting room prices to 1200-1500₸/hour');

    // Update private offices
    const privateOffices = await Workspace.find({ type: 'private_office' });
    for (const office of privateOffices) {
      const newPrice = office.capacity >= 6 ? 3000 : 2500;
      office.pricePerHour = newPrice;
      await office.save();
    }
    console.log('✓ Updated private office prices to 2500-3000₸/hour');

    console.log('\n✅ All prices updated successfully!');
    console.log('\nNew pricing structure:');
    console.log('- Hot desk: 400₸/hour (~3,200₸/day, ~70,400₸/month)');
    console.log('- Dedicated desk: 500₸/hour (~4,000₸/day, ~88,000₸/month)');
    console.log('- Meeting room: 1200-1500₸/hour');
    console.log('- Private office: 2500-3000₸/hour');

    process.exit(0);
  } catch (error) {
    console.error('Error updating prices:', error);
    process.exit(1);
  }
};

updatePrices();
