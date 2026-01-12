const express = require('express');
const router = express.Router();
const driverController = require('../controllers/drive'); // ✅ existing CRUD controller

const authentication = require('../middleware/authentication');
const authorizeRoles = require('../middleware/authorizeRoles');

// 🔐 All driver routes require login
router.use(authentication);

// ===================== CRUD + Assignment =====================

// CREATE DRIVER
router.post('/', driverController.createDriver);

// GET ALL DRIVERS
router.get('/', driverController.getAllDrivers);

// GET SINGLE DRIVER
router.get('/:id', driverController.getDriverById);

// UPDATE DRIVER
router.put('/:id', driverController.updateDriver);

// DELETE DRIVER
router.delete('/:id', driverController.deleteDriver);

// ASSIGN VEHICLE TO DRIVER
router.post('/assign-vehicle', driverController.assignVehicleToDriver);

// UNASSIGN VEHICLE FROM DRIVER
router.put('/unassign-vehicle/:id', driverController.unassignVehicleFromDriver);

// ===================== AGGREGATION REPORT ROUTES =====================

// Only Admin & Manager can access reports
router.get('/reports/total', authorizeRoles('admin', 'manager'), driverController.totalDrivers);
router.get('/reports/availability', authorizeRoles('admin', 'manager'), driverController.driversByAvailability);
router.get('/reports/assignment', authorizeRoles('admin', 'manager'), driverController.assignedVsFreeDrivers);
router.get('/reports/license-type', authorizeRoles('admin', 'manager'), driverController.driversByLicenseType);
router.get('/reports/monthly', authorizeRoles('admin', 'manager'), driverController.monthlyDriverReport);

module.exports = router;
