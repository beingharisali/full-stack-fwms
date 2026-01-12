const model = require('../models/Driver');
const Vehicle = require('../models/Vehicle'); 

const createDriver = async (req, res) => {
    try {
        const { name, licenseNumber, licenseType } = req.body;

        if (!name || !licenseNumber || !licenseType) {
            return res.status(400).json({
                success: false,
                msg: "Please provide name, license number, and license type"
            });
        }

        const driver = await model.create(req.body);
        res.status(201).json({
            success: true,
            msg: "driver created successfully",
            driver: driver
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: "Error occurred in creating driver",
            error: error.message
        });
    }
};

const getAllDrivers = async (req, res) => {
    try {
        const drivers = await model.find().populate('assignedVehicle'); // ✅ populate
        res.status(200).json({
            success: true,
            count: drivers.length,
            drivers: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error fetching drivers",
            error: error
        });
    }
};

const getDriverById = async (req, res) => {
    try {
        const driver = await model
            .findById(req.params.id)
            .populate('assignedVehicle'); 

        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "driver not found"
            });
        }

        res.status(200).json({
            success: true,
            driver: driver
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: "invalid driver id",
            error: error
        });
    }
};

const updateDriver = async (req, res) => {
    try {
        const driver = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "driver not found"
            });
        }

        res.status(200).json({
            success: true,
            msg: "driver updated successfully",
            driver: driver
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: "Error updating driver",
            error: error.message
        });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const driver = await model.findByIdAndDelete(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "driver not found"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Driver deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: "Error deleting driver",
            error: error
        });
    }
};

const assignVehicleToDriver = async (req, res) => {
    try {
        const { driverId, vehicleId } = req.body;

        const driver = await model.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "Driver not found"
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                msg: "Vehicle not found"
            });
        }

        if (driver.assignedVehicle) {
            return res.status(400).json({
                success: false,
                msg: "Driver already has a vehicle"
            });
        }

        if (vehicle.assignedTo) {
            return res.status(400).json({
                success: false,
                msg: "Vehicle already assigned"
            });
        }

        driver.assignedVehicle = vehicle._id;
        vehicle.assignedTo = driver._id;

        await driver.save();
        await vehicle.save();

        res.status(200).json({
            success: true,
            msg: "Vehicle assigned successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error assigning vehicle",
            error: error.message
        });
    }
};

const unassignVehicleFromDriver = async (req, res) => {
    try {
        const driver = await model.findById(req.params.id);

        if (!driver || !driver.assignedVehicle) {
            return res.status(400).json({
                success: false,
                msg: "No vehicle assigned to this driver"
            });
        }

        const vehicle = await Vehicle.findById(driver.assignedVehicle);

        driver.assignedVehicle = null;
        vehicle.assignedTo = null;

        await driver.save();
        await vehicle.save();

        res.status(200).json({
            success: true,
            msg: "Vehicle unassigned successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error unassigning vehicle",
            error: error.message
        });
    }
};

const totalDrivers = async (req, res) => {
  try {
    const result = await model.aggregate([{ $count: "totalDrivers" }]);
    res.status(200).json({
      success: true,
      totalDrivers: result[0]?.totalDrivers || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error getting total drivers" });
  }
};
const driversByAvailability = async (req, res) => {
  try {
    const result = await model.aggregate([
      { $group: { _id: "$available", count: { $sum: 1 } } }
    ]);

    const formatted = result.map(r => ({
      status: r._id ? "Available" : "Not Available",
      count: r.count
    }));

    res.status(200).json({ success: true, report: formatted });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error getting availability report" });
  }
};
const assignedVsFreeDrivers = async (req, res) => {
  try {
    const result = await model.aggregate([
      { $group: { _id: { $cond: [{ $ifNull: ["$assignedVehicle", false] }, "Assigned", "Free"] }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error getting assigned/free drivers" });
  }
};
const driversByLicenseType = async (req, res) => {
  try {
    const result = await model.aggregate([
      { $group: { _id: "$licenseType", count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error getting license type report" });
  }
};
const monthlyDriverReport = async (req, res) => {
  try {
    const result = await model.aggregate([
      { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } }
    ]);

    res.status(200).json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error getting monthly driver report" });
  }
};
module.exports = {
    totalDrivers,
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    assignVehicleToDriver,
    unassignVehicleFromDriver,
    driversByAvailability,
    assignedVsFreeDrivers,
    driversByLicenseType,
    monthlyDriverReport
};
