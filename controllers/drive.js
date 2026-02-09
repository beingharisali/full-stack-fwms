const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

// ✅ Final Centralized Error Handler (Fixed 'next' issue)
const handleControllerError = (res, next, error, customMsg) => {
    console.error(`!!! BACKEND_ERROR [${customMsg}]:`, error);
    
    // Check if next is valid, otherwise use res directly
    if (typeof next === 'function') {
        return next(error);
    }
    
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return res.status(statusCode).json({
        success: false,
        msg: error.message || customMsg,
        error: error.message
    });
};

/* ================= DRIVER CRUD ================= */

const createDriver = async (req, res, next) => {
    try {
        const { name, licenseNumber, licenseType, email, password } = req.body;

        // 1. Basic Validation
        if (!name || !licenseNumber || !licenseType) {
            return res.status(400).json({
                success: false,
                msg: "Please provide name, license number, and license type",
            });
        }

        let createdUser = null;

        // 2. User Account Logic
        if (email || password) {
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    msg: "Both email and password are required to create a login",
                });
            }

            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    msg: "Email already exists",
                });
            }

            const parts = (name || "").trim().split(/\s+/);
            const firstName = parts.shift() || name;
            const lastName = parts.join(" ") || "Driver"; 

            createdUser = await User.create({
                firstName,
                lastName,
                email: email.toLowerCase(),
                password,
                role: "driver",
            });
        }

        // 3. Create Driver Profile
        const driverData = { name, licenseNumber, licenseType };
        const driver = await Driver.create(driverData);

        // 4. Success Response
        return res.status(201).json({
            success: true,
            msg: "Driver created successfully",
            driver,
            user: createdUser ? {
                _id: createdUser._id,
                firstName: createdUser.firstName,
                lastName: createdUser.lastName,
                email: createdUser.email,
                role: createdUser.role,
                token: createdUser.createJWT ? createdUser.createJWT() : null,
            } : null,
        });

    } catch (error) {
        return handleControllerError(res, next, error, "Error creating driver");
    }
};

const getAllDrivers = async (req, res, next) => {
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
        return handleControllerError(res, next, error, "Error fetching drivers");
    }
};

const getDriverById = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id).populate("assignedVehicle");
        if (!driver) return res.status(404).json({ success: false, msg: "Driver not found" });
        res.status(200).json({ success: true, driver });
    } catch (error) {
        return handleControllerError(res, next, error, "Invalid driver ID");
    }
};

const getDriverByUserId = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });

        const driversList = await Driver.find();
        const driver = driversList.find(d => 
            d.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase()
        );

        if (!driver) return res.status(404).json({ success: false, msg: "No driver profile found" });

        const populatedDriver = await Driver.findById(driver._id).populate("assignedVehicle");
        res.status(200).json({ success: true, driver: populatedDriver });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching driver profile");
    }
};

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

const deleteDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ success: false, msg: "Driver not found" });
        res.status(200).json({ success: true, msg: "Driver deleted successfully" });
    } catch (error) {
        return handleControllerError(res, next, error, "Error deleting driver");
    }
};

/* ================= VEHICLE ASSIGNMENT ================= */

const assignVehicleToDriver = async (req, res, next) => {
    try {
        const { driverId, vehicleId } = req.body;
        const driver = await Driver.findById(driverId);
        const vehicle = await Vehicle.findById(vehicleId);

        if (!driver || !vehicle) return res.status(404).json({ success: false, msg: "Driver or Vehicle not found" });
        if (driver.assignedVehicle || vehicle.assignedTo) return res.status(400).json({ success: false, msg: "Already assigned" });

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

/* ================= REPORTS ================= */

const totalDrivers = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $count: "total" }]);
        res.status(200).json({ success: true, totalDrivers: result[0]?.total || 0 });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching total drivers");
    }
};

const driversByAvailability = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $group: { _id: "$available", count: { $sum: 1 } } }]);
        const report = result.map(r => ({ status: r._id ? "Available" : "Not Available", count: r.count }));
        res.status(200).json({ success: true, report });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching availability report");
    }
};

const assignedVsFreeDrivers = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{
            $group: {
                _id: { $cond: [{ $ifNull: ["$assignedVehicle", false] }, "Assigned", "Free"] },
                count: { $sum: 1 },
            }
        }]);
        res.status(200).json({ success: true, report: result });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching assignment report");
    }
};

const driversByLicenseType = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([{ $group: { _id: "$licenseType", count: { $sum: 1 } } }]);
        res.status(200).json({ success: true, report: result });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching license report");
    }
};

const monthlyDriverReport = async (req, res, next) => {
    try {
        const result = await Driver.aggregate([
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.status(200).json({ success: true, report: result });
    } catch (error) {
        return handleControllerError(res, next, error, "Error fetching monthly report");
    }
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