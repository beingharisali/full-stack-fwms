const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ["Car", "Bike", "Truck", "Van"],
      required: true
    },
    status: {
      type: String,
      enum: ["Available", "In-Use", "Maintenance", "Inactive"],
      default: "Available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
