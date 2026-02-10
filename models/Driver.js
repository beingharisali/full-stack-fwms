// server/models/Driver.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true, 
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, 
    },
    licenseType: {
      type: String,
      enum: ['Motorcycle', 'LTV', 'HTV', 'PSV'], 
      required: true,
      index: true, 
    },
    available: {
      type: Boolean,
      default: true,
      index: true, 
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true, 
    },
  },
  { timestamps: true }
);


driverSchema.index({ available: 1, licenseType: 1 });

driverSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Driver', driverSchema);

