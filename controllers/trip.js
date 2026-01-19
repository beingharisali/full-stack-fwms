const Trip = require("../models/trip");

/**
 * CREATE TRIP
 */
const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create({
      departure: req.body.departure,
      destination: req.body.destination,
      arrivalTime: req.body.arrivalTime,
      departureTime: req.body.departureTime,
      date: req.body.date,
      createdBy: req.user?.userId || req.body.createdBy
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET ALL TRIPS
 */
const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate(
      "createdBy",
      "name email"
    );

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE TRIP
 */
const getSingleTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE TRIP
 */
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE TRIP
 */
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({
      success: true,
      message: "Trip deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getSingleTrip,
  updateTrip,
  deleteTrip
};

console.log();