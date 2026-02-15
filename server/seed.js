import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from './models/Workspace.js';

dotenv.config();

const sampleWorkspaces = [
  // Floor 1 - Desks
  { name: 'Desk 1A', type: 'desk', pricePerHour: 2000, capacity: 1, floor: 1, description: 'Individual desk with monitor', amenities: ['WiFi', 'Monitor', 'Keyboard', 'Mouse'], isActive: true },
  { name: 'Desk 1B', type: 'desk', pricePerHour: 2500, capacity: 1, floor: 1, description: 'Premium desk with standing option', amenities: ['WiFi', 'Monitor', 'Standing Desk', 'Locker'], isActive: true },
  { name: 'Desk 1C', type: 'desk', pricePerHour: 2000, capacity: 1, floor: 1, description: 'Standard workspace', amenities: ['WiFi', 'Monitor'], isActive: true },
  { name: 'Desk 1D', type: 'desk', pricePerHour: 2200, capacity: 1, floor: 1, description: 'Ergonomic workspace', amenities: ['WiFi', 'Monitor', 'Ergonomic chair'], isActive: true },
  
  // Floor 1 - Meeting Rooms
  { name: 'Meeting Room Alpha', type: 'meeting_room', pricePerHour: 5000, capacity: 8, floor: 1, description: 'Large meeting room with projector', amenities: ['WiFi', 'Projector', 'Whiteboard', 'Monitor', 'Coffee'], isActive: true },
  { name: 'Meeting Room Beta', type: 'meeting_room', pricePerHour: 4000, capacity: 6, floor: 1, description: 'Medium meeting room', amenities: ['WiFi', 'Whiteboard', 'Monitor'], isActive: true },
  
  // Floor 1 - Hot Desks
  { name: 'Hot Desk 1', type: 'hot_desk', pricePerHour: 1500, capacity: 1, floor: 1, description: 'Flexible workspace', amenities: ['WiFi', 'Coffee'], isActive: true },
  { name: 'Hot Desk 2', type: 'hot_desk', pricePerHour: 1500, capacity: 1, floor: 1, description: 'Open area desk', amenities: ['WiFi', 'Coffee'], isActive: true },
  { name: 'Hot Desk 3', type: 'hot_desk', pricePerHour: 1500, capacity: 1, floor: 1, description: 'Common area', amenities: ['WiFi', 'Coffee'], isActive: true },
  
  // Floor 2 - Desks
  { name: 'Dedicated Desk 2A', type: 'desk', pricePerHour: 2500, capacity: 1, floor: 2, description: 'Personal desk with locker', amenities: ['WiFi', 'Monitor', 'Locker', 'Keyboard', 'Mouse'], isActive: true },
  { name: 'Dedicated Desk 2B', type: 'desk', pricePerHour: 2500, capacity: 1, floor: 2, description: 'Personal desk with storage', amenities: ['WiFi', 'Monitor', 'Locker'], isActive: true },
  { name: 'Dedicated Desk 2C', type: 'desk', pricePerHour: 2300, capacity: 1, floor: 2, description: 'Window-side desk', amenities: ['WiFi', 'Monitor'], isActive: true },
  { name: 'Dedicated Desk 2D', type: 'desk', pricePerHour: 2800, capacity: 1, floor: 2, description: 'Premium setup', amenities: ['WiFi', 'Monitor', 'Webcam', 'Headset', 'Locker'], isActive: true },
  
  // Floor 2 - Meeting Rooms
  { name: 'Conference Room A', type: 'meeting_room', pricePerHour: 6000, capacity: 12, floor: 2, description: 'Large conference room', amenities: ['WiFi', 'Projector', 'Whiteboard', 'Monitor', 'Coffee', 'Phone Booth'], isActive: true },
  
  // Floor 3 - Private Offices
  { name: 'Private Office 3A', type: 'private_office', pricePerHour: 8000, capacity: 4, floor: 3, description: 'Small team office', amenities: ['WiFi', 'Monitor', 'Printer', 'Air Conditioning', 'Locker'], isActive: true },
  { name: 'Private Office 3B', type: 'private_office', pricePerHour: 10000, capacity: 6, floor: 3, description: 'Medium team office with meeting table', amenities: ['WiFi', 'Monitor', 'Printer', 'Scanner', 'Air Conditioning', 'Whiteboard'], isActive: true },
  
  // Floor 4 - Mixed
  { name: 'Executive Office', type: 'private_office', pricePerHour: 12000, capacity: 8, floor: 4, description: 'Premium executive office', amenities: ['WiFi', 'Monitor', 'Printer', 'Scanner', 'Air Conditioning', 'Coffee', 'Locker', 'Whiteboard'], isActive: true },
  { name: 'Meeting Pod', type: 'meeting_room', pricePerHour: 3500, capacity: 4, floor: 4, description: 'Small meeting pod', amenities: ['WiFi', 'Monitor', 'Whiteboard'], isActive: true },
  { name: 'Focus Desk 4A', type: 'desk', pricePerHour: 2600, capacity: 1, floor: 4, description: 'Quiet zone desk', amenities: ['WiFi', 'Monitor', 'Headset'], isActive: true },
  { name: 'Focus Desk 4B', type: 'desk', pricePerHour: 2600, capacity: 1, floor: 4, description: 'Quiet zone desk', amenities: ['WiFi', 'Monitor', 'Headset'], isActive: true },
  
  // Floor 1 - Additional
  { name: 'Desk 1E', type: 'desk', pricePerHour: 2100, capacity: 1, floor: 1, description: 'Standard desk', amenities: ['WiFi', 'Monitor'], isActive: true },
  { name: 'Desk 1F', type: 'desk', pricePerHour: 2300, capacity: 1, floor: 1, description: 'Desk with webcam', amenities: ['WiFi', 'Monitor', 'Webcam'], isActive: true },
  { name: 'Hot Desk 4', type: 'hot_desk', pricePerHour: 1500, capacity: 1, floor: 1, description: 'Flexible seating', amenities: ['WiFi', 'Coffee'], isActive: true },
  { name: 'Hot Desk 5', type: 'hot_desk', pricePerHour: 1500, capacity: 1, floor: 1, description: 'Open workspace', amenities: ['WiFi', 'Coffee'], isActive: true },
  
  // Floor 2 - Additional
  { name: 'Desk 2E', type: 'desk', pricePerHour: 2400, capacity: 1, floor: 2, description: 'Standard desk', amenities: ['WiFi', 'Monitor', 'Keyboard'], isActive: true },
  { name: 'Meeting Room Gamma', type: 'meeting_room', pricePerHour: 4500, capacity: 8, floor: 2, description: 'Modern meeting space', amenities: ['WiFi', 'Projector', 'Whiteboard', 'Coffee'], isActive: true },
  
  // Floor 3 - Additional
  { name: 'Private Office 3C', type: 'private_office', pricePerHour: 9000, capacity: 5, floor: 3, description: 'Team office', amenities: ['WiFi', 'Monitor', 'Printer', 'Air Conditioning'], isActive: true },
  { name: 'Desk 3A', type: 'desk', pricePerHour: 2700, capacity: 1, floor: 3, description: 'Premium desk', amenities: ['WiFi', 'Monitor', 'Locker', 'Standing Desk'], isActive: true },
  { name: 'Hot Desk 3-1', type: 'hot_desk', pricePerHour: 1800, capacity: 1, floor: 3, description: 'Quiet hot desk', amenities: ['WiFi', 'Coffee'], isActive: true },
  { name: 'Hot Desk 3-2', type: 'hot_desk', pricePerHour: 1800, capacity: 1, floor: 3, description: 'Quiet hot desk', amenities: ['WiFi', 'Coffee'], isActive: true }
];

const seedWorkspaces = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing workspaces
    await Workspace.deleteMany({});
    console.log('Existing workspaces cleared');

    // Insert sample workspaces
    const created = await Workspace.insertMany(sampleWorkspaces);
    console.log(`${created.length} workspaces created successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedWorkspaces();
