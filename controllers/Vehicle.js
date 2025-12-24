const model = require("../models/Vehicle")

const createVehicle = async (req, res )=>{
    try{

        const vehicle = await model.create(req.body) 
        res.status(201).json({
            success:true,
            msg:"vehicle created successfully",
            vehicle:vehicle
        })
    }catch(error){
        res.status(400).json({
            success:false,
            msg: "Error occured in creating vehicle",
            error:error
        })
    }
}

const getAllVehicles = async (req, res)=>{
    try {
        const vehicle = await model.find()
        res.status(200).json({
            success:true,
            count: vehicle.length,
            vehicles: vehicle
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            msg:"Error fetching vehicles",
            error:error
        })
    }
}

const singleVehicle = async (req, res) => {
    try {
        const vehicle = await model.findById(req.params.id)
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                msg: "vehicle not found"
            })
        }
        res.status(200).json({
            success: true,
            vehicle: vehicle
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: "invalid vehicle id",
            error: error
        })
    }
}

const updateVehicle = async (req, res) => {
    try {
        const vehicle = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                msg: "vehicle not found"
            })
        }
        res.status(200).json({
            success: true,
            msg: "vehicle updated successfully",
            vehicle: vehicle
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: "Error updating vehicle",
            error: error
        })
    }
}

const deleteVehicle = async(req,res)=>{
    try {
        const vehicle = await model.findByIdAndDelete(req.params.id)
      
        if(!vehicle){
            return res.status(404).json({
                success:false,
                msg:"vehicle not found"
            })
        }
        res.status(200).json({
      success: true,
      msg: "Vehicle deleted successfully"
    })

    } catch (error) {
        res.status(400).json({
      success: false,
      msg: "Error deleting vehicle",
      error
    })
    }
}











module.exports = {createVehicle,getAllVehicles,singleVehicle,updateVehicle,deleteVehicle}