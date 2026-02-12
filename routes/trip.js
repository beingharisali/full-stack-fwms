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
    getMyTrips // 1. Isse controller se import karein
} = require("../controllers/trip");

const authenticateUser = require("../middleware/authentication"); // 2. Auth middleware lazmi layein

// --- ROUTES ---

// NOTE: Specific routes (jaise /my-trips) hamesha Dynamic routes (/:id) se UPAR hone chahiye
router.get("/my-trips", authenticateUser, getMyTrips); 

router.post("/", authenticateUser, createTrip);
router.get("/", authenticateUser, getAllTrips);
router.get("/:id", authenticateUser, getSingleTrip); // Agar niche hoga to masla nahi karega
router.put("/:id", authenticateUser, updateTrip);
router.delete("/:id", authenticateUser, deleteTrip);
router.post("/assign", authenticateUser, assignTrip);
router.post("/unassign", authenticateUser, unassignTrip);

module.exports = router;