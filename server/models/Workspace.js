import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['desk', 'meeting_room', 'private_office', 'hot_desk'],
    required: [true, 'Workspace type is required']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: '/images/workspace-default.jpg'
  },
  amenities: [{
    type: String
  }],
  floor: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;

