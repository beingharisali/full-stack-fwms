const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    departure: {
      type: String,
      required: true
    },

    destination: {
      type: String,
      required: true
    },

    arrivalTime: {
      type: String,
      required: true
    },

    departureTime: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
