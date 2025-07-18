const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  metrics: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
dashboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;
