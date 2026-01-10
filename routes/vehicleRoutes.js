const express = require("express");
const router = express.Router();

const {
  createVehicle,
  getAllVehicles,
  singleVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/Vehicle");

const authentication = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");

// 🔐 All vehicle routes require login
router.use(authentication);

// 🔵 Admin & Manager → view drivers / vehicles
router.get(
  "/",
  authorizeRoles("driver"),
  getAllVehicles
);

router.get(
  "/:id",
  authorizeRoles("driver"),
  singleVehicle
);

// 🔴 Only Admin → create / update / delete
router.post(
  "/",
  authorizeRoles("admin"),
  createVehicle
);

router.put(
  "/:id",
  authorizeRoles("admin"),
  updateVehicle
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  deleteVehicle
);

module.exports = router;
