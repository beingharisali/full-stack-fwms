const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true, 
    },
    type: {
      type: String,
      enum: ["Car", "Bike", "Truck", "Van"],
      required: true,
      index: true, 
    },
    status: {
      type: String,
      enum: ["Available", "In-Use", "Maintenance", "Inactive"],
      default: "Available",
      index: true, 
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
      index: true, 
    },
  },
  { timestamps: true }
);


vehicleSchema.index({ status: 1, type: 1 });

vehicleSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);

console.log();