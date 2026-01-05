const express = require('express');
const router = express.Router();
const driverController = require('../controllers/drive'); // ✅ correct name

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

// ⭐ ASSIGN VEHICLE TO DRIVER
router.post('/assign-vehicle', driverController.assignVehicleToDriver);

// ⭐ UNASSIGN VEHICLE FROM DRIVER
router.put('/unassign-vehicle/:id', driverController.unassignVehicleFromDriver);

module.exports = router;
