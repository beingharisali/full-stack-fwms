const express = require("express");
const router = express.Router();
const {
  createTrip,
  getAllTrips,
  getSingleTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/trip");

router.post("/", createTrip);
router.get("/", getAllTrips);
router.get("/:id", getSingleTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

module.exports = router;
