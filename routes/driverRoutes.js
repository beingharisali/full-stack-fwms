const express = require("express");
const router = express.Router();

const driverController = require("../controllers/drive");
const authentication = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");

// 🔐 Authentication for all driver routes
router.use(authentication);

/* ================= REPORT ROUTES (ALWAYS ON TOP) ================= */

router.get(
	"/reports/total",
	authorizeRoles("admin", "manager"),
	driverController.totalDrivers,
);

router.get(
	"/reports/availability",
	authorizeRoles("admin", "manager"),
	driverController.driversByAvailability,
);

router.get(
	"/reports/assignment",
	authorizeRoles("admin", "manager"),
	driverController.assignedVsFreeDrivers,
);

router.get(
	"/reports/license-type",
	authorizeRoles("admin", "manager"),
	driverController.driversByLicenseType,
);

router.get(
	"/reports/monthly",
	authorizeRoles("admin", "manager"),
	driverController.monthlyDriverReport,
);

/* ================= DRIVER CRUD ================= */

// ➕ Create Driver (Admin / Manager)
router.post(
	"/",
	authorizeRoles("admin", "manager"),(req, res, next) =>
	driverController.createDriver(req, res, next),
);

// 📄 Get All Drivers
router.get(
	"/",
	authorizeRoles("admin", "manager"),
	driverController.getAllDrivers,
);

// 📄 Get Driver Profile by Current User
router.get("/profile/me", driverController.getDriverByUserId);

// 📄 Get Driver by ID
router.get(
	"/:id",
	authorizeRoles("admin", "manager"),
	driverController.getDriverById,
);

// ✏ Update Driver
router.put(
	"/:id",
	authorizeRoles("admin", "manager"),
	driverController.updateDriver,
);

// ❌ Delete Driver (Admin only)
router.delete("/:id", authorizeRoles("admin"), driverController.deleteDriver);

/* ================= VEHICLE ASSIGNMENT ================= */

// 🚗 Assign vehicle
router.post(
	"/assign-vehicle",
	authorizeRoles("admin", "manager"),
	driverController.assignVehicleToDriver,
);

// 🚙 Unassign vehicle
router.put(
	"/unassign-vehicle/:id",
	authorizeRoles("admin", "manager"),
	driverController.unassignVehicleFromDriver,
);

module.exports = router;
