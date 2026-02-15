import mongoose from 'mongoose';

const analyticsCacheSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['dailyRevenue', 'workspacePopularity', 'monthlyStats', 'kpi'],
    required: true,
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Automatically update the updatedAt field
analyticsCacheSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const AnalyticsCache = mongoose.model('AnalyticsCache', analyticsCacheSchema);

export default AnalyticsCache;

