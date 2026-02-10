const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

// ✅ Centralized Error Handler
const handleControllerError = (res, next, error, customMsg) => {
    console.error(`!!! BACKEND_ERROR [${customMsg}]:`, error);
    if (typeof next === 'function') return next(error);
    
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return res.status(statusCode).json({
        success: false,
        msg: error.message || customMsg,
        error: error.message
    });
};

/* ================= DRIVER CRUD ================= */

// ➕ Create Driver
const createDriver = async (req, res, next) => {
    try {
        const { name, licenseNumber, licenseType, email, password } = req.body;

        if (!name || !licenseNumber || !licenseType) {
            return res.status(400).json({
                success: false,
                msg: "Please provide name, license number, and license type",
            });
        }

        let createdUser = null;

        // User Account Logic
        if (email || password) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ success: false, msg: "Email already exists" });
            }

            const parts = (name || "").trim().split(/\s+/);
            createdUser = await User.create({
                firstName: parts.shift() || name,
                lastName: parts.join(" ") || "Driver",
                email: email.toLowerCase(),
                password,
                role: "driver",
            });
        }

        // Create Driver Profile with User ID link
        const driver = await Driver.create({
            name,
            licenseNumber,
            licenseType,
            user: createdUser ? createdUser._id : null // 🔗 Linking here
        });

        return res.status(201).json({
            success: true,
            msg: "Driver created successfully",
            driver,
            user: createdUser ? {
                _id: createdUser._id,
                email: createdUser.email,
                role: createdUser.role,
                token: createdUser.createJWT ? createdUser.createJWT() : null,
            } : null,
        });
    } catch (error) {
        return handleControllerError(res, next, error, "Error creating driver");
    }
};

// 📄 Get Driver Profile by Token (The Fixed Function)
const getDriverByUserId = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Ab hum direct user field search kar saktay hain kyunke model update ho gaya hai
        const driver = await Driver.findOne({ user: userId }).populate("assignedVehicle");

        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "No driver profile found for this user account",
            });
        }

        res.status(200).json({ success: true, driver });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching driver profile");
    }
};

// 📄 Get All Drivers
const getAllDrivers = async (req, res, next) => {
    try {
        const drivers = await Driver.find().populate("assignedVehicle").sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: drivers.length, drivers });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching drivers");
    }
};

// 📄 Get Driver by ID
const getDriverById = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id).populate("assignedVehicle");
        if (!driver) return res.status(404).json({ success: false, msg: "Driver not found" });
        res.status(200).json({ success: true, driver });
    } catch (error) {
        return handleControllerError(res, next, error, "Invalid driver ID");
    }
};

// ✏ Update Driver
const updateDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!driver) return res.status(404).json({ success: false, msg: "Driver not found" });
        res.status(200).json({ success: true, msg: "Driver updated successfully", driver });
    } catch (error) {
        return handleControllerError(res, next, error, "Error updating driver");
    }
};

// ❌ Delete Driver
const deleteDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ success: false, msg: "Driver not found" });
        res.status(200).json({ success: true, msg: "Driver deleted successfully" });
    } catch (error) {
        return handleControllerError(res, next, error, "Error deleting driver");
    }
};

/* ================= VEHICLE ASSIGNMENT & REPORTS ================= */

const assignVehicleToDriver = async (req, res, next) => {
    try {
        const { driverId, vehicleId } = req.body;
        const driver = await Driver.findById(driverId);
        const vehicle = await Vehicle.findById(vehicleId);
        if (!driver || !vehicle) return res.status(404).json({ success: false, msg: "Driver or Vehicle not found" });
        
        driver.assignedVehicle = vehicle._id;
        vehicle.assignedTo = driver._id;
        await driver.save();
        await vehicle.save();
        res.status(200).json({ success: true, msg: "Vehicle assigned successfully" });
    } catch (error) {
        return handleControllerError(res, next, error, "Error assigning vehicle");
    }
};

const unassignVehicleFromDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver || !driver.assignedVehicle) return res.status(400).json({ success: false, msg: "No vehicle assigned" });
        const vehicle = await Vehicle.findById(driver.assignedVehicle);
        driver.assignedVehicle = null;
        if (vehicle) vehicle.assignedTo = null;
        await driver.save();
        if (vehicle) await vehicle.save();
        res.status(200).json({ success: true, msg: "Vehicle unassigned successfully" });
    } catch (error) {
        return handleControllerError(res, next, error, "Error unassigning vehicle");
    }
};

const totalDrivers = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $count: "total" }]);
        res.status(200).json({ success: true, totalDrivers: result[0]?.total || 0 });
    } catch (error) { return handleControllerError(res, next, error, "Error"); }
};

const driversByAvailability = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $group: { _id: "$available", count: { $sum: 1 } } }]);
        res.status(200).json({ success: true, report: result });
    } catch (error) { return handleControllerError(res, next, error, "Error"); }
};

const assignedVsFreeDrivers = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $group: { _id: { $cond: ["$assignedVehicle", "Assigned", "Free"] }, count: { $sum: 1 } } }]);
        res.status(200).json({ success: true, report: result });
    } catch (error) { return handleControllerError(res, next, error, "Error"); }
};

const driversByLicenseType = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $group: { _id: "$licenseType", count: { $sum: 1 } } }]);
        res.status(200).json({ success: true, report: result });
    } catch (error) { return handleControllerError(res, next, error, "Error"); }
};

const monthlyDriverReport = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.status(200).json({ success: true, report: result });
    } catch (error) { return handleControllerError(res, next, error, "Error"); }
};

module.exports = {
    createDriver,
    getAllDrivers,
    getDriverById,
    getDriverByUserId,
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