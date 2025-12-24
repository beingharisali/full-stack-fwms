const model = require('../models/Driver')

const createDriver = async (req, res) => {
    try {
        const driver = await model.create(req.body) 
        res.status(201).json({
            success: true,
            msg: "driver created successfully",
            driver: driver
        })
    } catch(error) {
        res.status(400).json({
            success: false,
            msg: "Error occurred in creating driver",
            error: error
        })
    }
}

const getAllDrivers = async (req, res) => {
    try {
        const drivers = await model.find()
        res.status(200).json({
            success: true,
            count: drivers.length,
            drivers: drivers
        })
    } catch(error) {
        res.status(500).json({
            success: false,
            msg: "Error fetching drivers",
            error: error
        })
    }
}

const getDriverById = async (req, res) => {
    try {
        const driver = await model.findById(req.params.id)
        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "driver not found"
            })
        }
        res.status(200).json({
            success: true,
            driver: driver
        })
    } catch(error) {
        res.status(400).json({
            success: false,
            msg: "invalid driver id",
            error: error
        })
    }
}

const updateDriver = async (req, res) => {
    try {
        const driver = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "driver not found"
            })
        }
        res.status(200).json({
            success: true,
            msg: "driver updated successfully",
            driver: driver
        })
    } catch(error) {
        res.status(400).json({
            success: false,
            msg: "Error updating driver",
            error: error
        })
    }
}

const deleteDriver = async (req, res) => {
    try {
        const driver = await model.findByIdAndDelete(req.params.id)
        if (!driver) {
            return res.status(404).json({
                success: false,
                msg: "driver not found"
            })
        }
        res.status(200).json({
            success: true,
            msg: "Driver deleted successfully"
        })
    } catch(error) {
        res.status(400).json({
            success: false,
            msg: "Error deleting driver",
            error: error
        })
    }
}

module.exports = {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver
}