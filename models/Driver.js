// server/models/Driver.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true, // 🔹 search / sort fast
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // 🔹 fast lookup
    },
    licenseType: {
      type: String,
      enum: ['Motorcycle', 'LTV', 'HTV', 'PSV'], // ✅ fixed
      required: true,
      index: true, // 🔹 reports fast
    },
    available: {
      type: Boolean,
      default: true,
      index: true, // 🔹 availability reports
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true, // 🔹 assigned vs free
    },
  },
  { timestamps: true }
);

/* ===================== INDEXES ===================== */

// 🔥 Compound index for dashboard & reports
driverSchema.index({ available: 1, licenseType: 1 });

// 🔥 Monthly / time-based reports
driverSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Driver', driverSchema);
