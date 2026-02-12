const Trip = require("../models/trip");
const Driver = require("../models/Driver");

/**
 * CREATE TRIP
 */
const createTrip = async (req, res) => {
	try {
		const trip = await Trip.create({
			departure: req.body.departure,
			destination: req.body.destination,
			arrivalTime: req.body.arrivalTime,
			departureTime: req.body.departureTime,
			date: req.body.date,
			createdBy: req.user?.userId || req.body.createdBy,
		});

		res.status(201).json({
			success: true,
			data: trip,
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * GET ALL TRIPS
 */
const getAllTrips = async (req, res) => {
	try {
		const trips = await Trip.find()
			.populate("createdBy", "name email")
			.populate("assignedDriver", "name licenseNumber licenseType");

		res.json({
			success: true,
			data: trips,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * GET SINGLE TRIP
 */
const getSingleTrip = async (req, res) => {
	try {
		const trip = await Trip.findById(req.params.id)
			.populate("createdBy", "name email")
			.populate("assignedDriver", "name licenseNumber licenseType");

		if (!trip) {
			return res.status(404).json({ message: "Trip not found" });
		}

		res.json({
			success: true,
			data: trip,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * UPDATE TRIP
 */
const updateTrip = async (req, res) => {
	try {
		const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!trip) {
			return res.status(404).json({ message: "Trip not found" });
		}

		res.json({
			success: true,
			data: trip,
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * DELETE TRIP
 */
const deleteTrip = async (req, res) => {
	try {
		const trip = await Trip.findByIdAndDelete(req.params.id);

		if (!trip) {
			return res.status(404).json({ message: "Trip not found" });
		}

		res.json({
			success: true,
			message: "Trip deleted successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * ASSIGN TRIP TO DRIVER
 */
const assignTrip = async (req, res) => {
	try {
		const { tripId, driverId } = req.body;

		if (!tripId || !driverId) {
			return res.status(400).json({
				success: false,
				message: "Trip ID and Driver ID are required",
			});
		}

		// Check if trip exists
		const trip = await Trip.findById(tripId);
		if (!trip) {
			return res.status(404).json({
				success: false,
				message: "Trip not found",
			});
		}

		// Check if driver exists
		const driver = await Driver.findById(driverId);
		if (!driver) {
			return res.status(404).json({
				success: false,
				message: "Driver not found",
			});
		}

		// Check if driver is available
		if (!driver.available) {
			return res.status(400).json({
				success: false,
				message: "Driver is not available",
			});
		}

		// Assign the trip to the driver
		trip.assignedDriver = driverId;
		trip.status = "assigned";
		await trip.save();

		// Populate the response with driver and creator info
		await trip.populate([
			{ path: "assignedDriver", select: "name licenseNumber licenseType" },
			{ path: "createdBy", select: "name email" },
		]);

		res.status(200).json({
			success: true,
			message: "Trip assigned to driver successfully",
			data: trip,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

/**
 * UNASSIGN TRIP FROM DRIVER
 */
const unassignTrip = async (req, res) => {
	try {
		const { tripId } = req.body;

		if (!tripId) {
			return res.status(400).json({
				success: false,
				message: "Trip ID is required",
			});
		}

		const trip = await Trip.findById(tripId);
		if (!trip) {
			return res.status(404).json({
				success: false,
				message: "Trip not found",
			});
		}

		trip.assignedDriver = null;
		trip.status = "unassigned";
		await trip.save();

		await trip.populate([
			{ path: "assignedDriver", select: "name licenseNumber licenseType" },
			{ path: "createdBy", select: "name email" },
		]);

		res.status(200).json({
			success: true,
			message: "Trip unassigned from driver successfully",
			data: trip,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
const getMyTrips = async (req, res) => {
    try {
        // 1. Check karein ke authentication middleware se user mil raha hai
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // 2. Driver model mein check karein ke is User ID ka Driver ID kya hai
        // Kyunki 'assignedDriver' field mein 'Driver' model ki ID store hoti hai, 'User' ki nahi.
        const driverProfile = await Driver.findOne({ user: req.user.userId });
        
        if (!driverProfile) {
            return res.status(404).json({ success: false, message: "Driver profile not found" });
        }

        // 3. Trip find karein jahan assignedDriver match kare
        const trips = await Trip.find({ assignedDriver: driverProfile._id })
            .sort("-date")
            .populate("createdBy", "name email");

        res.status(200).json({
            success: true,
            count: trips.length,
            data: trips,
        });
    } catch (error) {
        console.error("Error in getMyTrips:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};

module.exports = {
	createTrip,
	getAllTrips,
	getSingleTrip,
	updateTrip,
	deleteTrip,
	assignTrip,
	unassignTrip,
	getMyTrips,
};
