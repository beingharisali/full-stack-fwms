const Vehicle = require("../models/Vehicle");

const createVehicle = async (req, res) => {
  try {
    const { number, type } = req.body;

    if (!number || !type) {
      return res.status(400).json({
        success: false,
        msg: "Please provide vehicle number and type",
      });
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      msg: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.code === 11000
        ? "Vehicle number already exists"
        : "Error creating vehicle",
      error: error.message,
    });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching vehicles",
      error: error.message,
    });
  }
};

const singleVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        msg: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Invalid vehicle ID",
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        msg: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Error updating vehicle",
      error: error.message,
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        msg: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Error deleting vehicle",
      error: error.message,
    });
  }
};


const totalVehicles = async (req, res) => {
  try {
    const result = await Vehicle.aggregate([
      { $count: "total" },
    ]);

    res.status(200).json({
      success: true,
      totalVehicles: result[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching total vehicles",
    });
  }
};

const vehiclesByStatus = async (req, res) => {
  try {
    const result = await Vehicle.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching status report",
    });
  }
};

const vehiclesByType = async (req, res) => {
  try {
    const result = await Vehicle.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching type report",
    });
  }
};

const assignedVsUnassigned = async (req, res) => {
  try {
    const result = await Vehicle.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$assignedTo", false] },
              "Assigned",
              "Unassigned",
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching assignment report",
    });
  }
};

const monthlyVehicleReport = async (req, res) => {
  try {
    const result = await Vehicle.aggregate([
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

    res.status(200).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching monthly report",
    });
  }
};

module.exports = {
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
};

console.log();