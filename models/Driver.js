// server/models/Driver.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseType: {
    type: String,
    enum: ['Motorcycle', 'LTV', 'HTV', 'PSV'], // vehicle license types
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
