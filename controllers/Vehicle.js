const model = require("../models/Vehicle");


const createVehicle = async (req, res) => {
  try {
    const { number, type } = req.body;

    if (!number || !type) {
      return res.status(400).json({
        success: false,
        msg: "Please provide vehicle number and type",
      });
    }

    const vehicle = await model.create(req.body);
    res.status(201).json({
      success: true,
      msg: "vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Error occurred in creating vehicle",
      error: error.message,
    });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicle = await model.find();
    res.status(200).json({
      success: true,
      count: vehicle.length,
      vehicles: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching vehicles",
      error,
    });
  }
};

const singleVehicle = async (req, res) => {
  try {
    const vehicle = await model.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        msg: "vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "invalid vehicle id",
      error,
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        msg: "vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      msg: "vehicle updated successfully",
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
    const vehicle = await model.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        msg: "vehicle not found",
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
    const result = await model.aggregate([
      { $count: "totalVehicles" },
    ]);

    res.status(200).json({
      success: true,
      totalVehicles: result[0]?.totalVehicles || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error getting total vehicles",
    });
  }
};


const vehiclesByStatus = async (req, res) => {
  try {
    const result = await model.aggregate([
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
      msg: "Error getting status report",
    });
  }
};


const vehiclesByType = async (req, res) => {
  try {
    const result = await model.aggregate([
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
      msg: "Error getting type report",
    });
  }
};


const assignedVsUnassigned = async (req, res) => {
  try {
    const result = await model.aggregate([
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
      msg: "Error getting assignment report",
    });
  }
};


const monthlyVehicleReport = async (req, res) => {
  try {
    const result = await model.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error getting monthly report",
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
