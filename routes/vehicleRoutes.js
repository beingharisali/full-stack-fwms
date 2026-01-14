const express = require("express");
const router = express.Router();

const {
  createVehicle,
  getAllVehicles,
  singleVehicle,
  updateVehicle,
  deleteVehicle,
  totalVehicles,
  vehiclesByStatus,
  vehiclesByType,
  assignedVsUnassigned,
  monthlyVehicleReport,
} = require("../controllers/Vehicle");


  

const authentication = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");


router.use(authentication);

router.get("/reports/total", authorizeRoles("admin", "manager"), totalVehicles);
router.get("/reports/status", authorizeRoles("admin", "manager"), vehiclesByStatus);
router.get("/reports/type", authorizeRoles("admin", "manager"), vehiclesByType);
router.get("/reports/assignment", authorizeRoles("admin", "manager"), assignedVsUnassigned);
router.get("/reports/monthly", authorizeRoles("admin", "manager"), monthlyVehicleReport);

router.get("/", authorizeRoles("driver"), getAllVehicles);
router.get("/:id", authorizeRoles("driver"), singleVehicle);

router.post("/", authorizeRoles("admin"), createVehicle);
router.put("/:id", authorizeRoles("admin"), updateVehicle);
router.delete("/:id", authorizeRoles("admin"), deleteVehicle);

module.exports = router;
