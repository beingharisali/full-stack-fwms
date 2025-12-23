const model = require('../models/Driver')

const createDriver = async (req, res )=>{
    try{

        const vehicle = await model.create(req.body) 
        res.status(201).json({
            success:true,
            msg:"driver created successfully",
            vehicle:vehicle
        })
    }catch(error){
        res.status(400).json({
            success:false,
            msg: "Error occured in creating driver",
            error:error
        })
    }
}




module.exports = createDriver