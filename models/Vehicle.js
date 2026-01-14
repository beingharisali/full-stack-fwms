const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true, // 🔹 fast lookup by vehicle number
    },
    type: {
      type: String,
      enum: ["Car", "Bike", "Truck", "Van"],
      required: true,
      index: true, // 🔹 type based reports
    },
    status: {
      type: String,
      enum: ["Available", "In-Use", "Maintenance", "Inactive"],
      default: "Available",
      index: true, // 🔹 availability & status reports
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
      index: true, // 🔹 assigned / unassigned vehicles
    },
  },
  { timestamps: true }
);

/* ===================== INDEXES ===================== */

// 🔥 Compound index for dashboards
vehicleSchema.index({ status: 1, type: 1 });

// 🔥 Time-based reports (monthly / weekly)
vehicleSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
