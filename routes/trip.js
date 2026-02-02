const express = require("express");
const router = express.Router();
const {
	createTrip,
	getAllTrips,
	getSingleTrip,
	updateTrip,
	deleteTrip,
	assignTrip,
	unassignTrip,
} = require("../controllers/trip");

router.post("/", createTrip);
router.get("/", getAllTrips);
router.get("/:id", getSingleTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/assign", assignTrip);
router.post("/unassign", unassignTrip);

module.exports = router;
