const express = require("express");
const router = express.Router();

const {
  createTrip,
  getAllTrips,
  getSingleTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/trip");

// CREATE TRIP
// POST /api/trips
router.post("/create-trip", createTrip);

// GET ALL TRIPS
// GET /api/trips
router.get("/", getAllTrips);

// GET SINGLE TRIP
// GET /api/trips/:id
router.get("/:id", getSingleTrip);

// UPDATE TRIP
// PUT /api/trips/:id
router.put("/:id", updateTrip);

// DELETE TRIP
// DELETE /api/trips/:id
router.delete("/:id", deleteTrip);

module.exports = router;
