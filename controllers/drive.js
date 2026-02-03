const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

const createDriver = async (req, res) => {
	try {
		const { name, licenseNumber, licenseType, email, password } = req.body;

		if (!name || !licenseNumber || !licenseType) {
			return res.status(400).json({
				success: false,
				msg: "Please provide name, license number, and license type",
			});
		}

		let createdUser = null;
		if (email || password) {
			if (!email || !password) {
				return res.status(400).json({
					success: false,
					msg: "Both email and password are required to create a login for the driver",
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
			const firstName = parts.shift() || "";
			const lastName = parts.join(" ") || "";

			createdUser = await User.create({
				firstName,
				lastName,
				email: email.toLowerCase(),
				password,
				role: "driver",
			});
		}

		const driverData = { name, licenseNumber, licenseType };
		const driver = await Driver.create(driverData);

		res.status(201).json({
			success: true,
			msg: "Driver created successfully",
			driver,
			user: createdUser
				? {
						_id: createdUser._id,
						firstName: createdUser.firstName,
						lastName: createdUser.lastName,
						email: createdUser.email,
						role: createdUser.role,
						token: createdUser.createJWT(),
					}
				: null,
		});
	} catch (error) {
		console.log(error);
	}
};

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

const getDriverById = async (req, res) => {
	try {
		const driver = await Driver.findById(req.params.id).populate(
			"assignedVehicle",
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

const getDriverByUserId = async (req, res) => {
	try {
		const userId = req.user.userId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				msg: "User not found",
			});
		}

		const driver = await Driver.find().then((drivers) => {
			return drivers.find(
				(d) =>
					d.name.toLowerCase() ===
					`${user.firstName} ${user.lastName}`.toLowerCase(),
			);
		});

		if (!driver) {
			return res.status(404).json({
				success: false,
				msg: "No driver profile found for this user",
			});
		}

		// Populate assigned vehicle
		const populatedDriver = await Driver.findById(driver._id).populate(
			"assignedVehicle",
		);

		res.status(200).json({
			success: true,
			driver: populatedDriver,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			msg: "Error fetching driver profile",
			error: error.message,
		});
	}
};

const updateDriver = async (req, res) => {
	try {
		const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

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

const totalDrivers = async (req, res) => {
	try {
		const result = await Driver.aggregate([{ $count: "total" }]);
		res.status(200).json({
			success: true,
			totalDrivers: result[0]?.total || 0,
		});
	} catch {
		res
			.status(500)
			.json({ success: false, msg: "Error fetching total drivers" });
	}
};

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
		res
			.status(500)
			.json({ success: false, msg: "Error fetching availability" });
	}
};

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
		res
			.status(500)
			.json({ success: false, msg: "Error fetching assigned/free" });
	}
};

const driversByLicenseType = async (req, res) => {
	try {
		const result = await Driver.aggregate([
			{ $group: { _id: "$licenseType", count: { $sum: 1 } } },
		]);

		res.status(200).json({ success: true, report: result });
	} catch {
		res
			.status(500)
			.json({ success: false, msg: "Error fetching license report" });
	}
};

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
		res
			.status(500)
			.json({ success: false, msg: "Error fetching monthly report" });
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
