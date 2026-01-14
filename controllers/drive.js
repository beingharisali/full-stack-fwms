const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");

/* ================= CREATE DRIVER ================= */
const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseType } = req.body;

    if (!name || !licenseNumber || !licenseType) {
      return res.status(400).json({
        success: false,
        msg: "Please provide name, license number, and license type",
      });
    }

    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      msg: "Driver created successfully",
      driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg:
        error.code === 11000
          ? "License number already exists"
          : "Error creating driver",
      error: error.message,
    });
  }
};

/* ================= GET ALL DRIVERS ================= */
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("assignedVehicle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching drivers",
      error: error.message,
    });
  }
};

/* ================= GET SINGLE DRIVER ================= */
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate(
      "assignedVehicle"
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        msg: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Invalid driver ID",
    });
  }
};

/* ================= UPDATE DRIVER ================= */
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        msg: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Driver updated successfully",
      driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Error updating driver",
      error: error.message,
    });
  }
};

/* ================= DELETE DRIVER ================= */
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        msg: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Driver deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Error deleting driver",
      error: error.message,
    });
  }
};

/* ================= ASSIGN VEHICLE ================= */
const assignVehicleToDriver = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;

    const driver = await Driver.findById(driverId);
    const vehicle = await Vehicle.findById(vehicleId);

    if (!driver || !vehicle) {
      return res.status(404).json({
        success: false,
        msg: "Driver or Vehicle not found",
      });
    }

    if (driver.assignedVehicle || vehicle.assignedTo) {
      return res.status(400).json({
        success: false,
        msg: "Driver or Vehicle already assigned",
      });
    }

    driver.assignedVehicle = vehicle._id;
    vehicle.assignedTo = driver._id;

    await driver.save();
    await vehicle.save();

    res.status(200).json({
      success: true,
      msg: "Vehicle assigned successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error assigning vehicle",
      error: error.message,
    });
  }
};

/* ================= UNASSIGN VEHICLE ================= */
const unassignVehicleFromDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver || !driver.assignedVehicle) {
      return res.status(400).json({
        success: false,
        msg: "No vehicle assigned to this driver",
      });
    }

    const vehicle = await Vehicle.findById(driver.assignedVehicle);

    driver.assignedVehicle = null;
    vehicle.assignedTo = null;

    await driver.save();
    await vehicle.save();

    res.status(200).json({
      success: true,
      msg: "Vehicle unassigned successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error unassigning vehicle",
      error: error.message,
    });
  }
};

/* ================= AGGREGATION REPORTS ================= */

/* 🔹 TOTAL DRIVERS */
const totalDrivers = async (req, res) => {
  try {
    const result = await Driver.aggregate([{ $count: "total" }]);
    res.status(200).json({
      success: true,
      totalDrivers: result[0]?.total || 0,
    });
  } catch {
    res.status(500).json({ success: false, msg: "Error fetching total drivers" });
  }
};

/* 🔹 AVAILABLE VS NOT AVAILABLE */
const driversByAvailability = async (req, res) => {
  try {
    const result = await Driver.aggregate([
      { $group: { _id: "$available", count: { $sum: 1 } } },
    ]);

    const report = result.map((r) => ({
      status: r._id ? "Available" : "Not Available",
      count: r.count,
    }));

    res.status(200).json({ success: true, report });
  } catch {
    res.status(500).json({ success: false, msg: "Error fetching availability" });
  }
};

/* 🔹 ASSIGNED VS FREE */
const assignedVsFreeDrivers = async (req, res) => {
  try {
    const result = await Driver.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$assignedVehicle", false] },
              "Assigned",
              "Free",
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, report: result });
  } catch {
    res.status(500).json({ success: false, msg: "Error fetching assigned/free" });
  }
};

/* 🔹 LICENSE TYPE REPORT */
const driversByLicenseType = async (req, res) => {
  try {
    const result = await Driver.aggregate([
      { $group: { _id: "$licenseType", count: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, report: result });
  } catch {
    res.status(500).json({ success: false, msg: "Error fetching license report" });
  }
};

/* 🔹 MONTHLY REPORT */
const monthlyDriverReport = async (req, res) => {
  try {
    const result = await Driver.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({ success: true, report: result });
  } catch {
    res.status(500).json({ success: false, msg: "Error fetching monthly report" });
  }
};

/* ================= EXPORTS ================= */
module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  assignVehicleToDriver,
  unassignVehicleFromDriver,
  totalDrivers,
  driversByAvailability,
  assignedVsFreeDrivers,
  driversByLicenseType,
  monthlyDriverReport,
};
