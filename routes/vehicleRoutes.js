const express = require("express")
const router = express.Router()

const {
  createVehicle,getAllVehicles,singleVehicle,updateVehicle,deleteVehicle
} = require("../controllers/Vehicle")

const auth = require("../middleware/authentication")

// routes
router.post("/create-vehicle",auth, createVehicle)
router.get("/all-vehicle",auth, getAllVehicles)
router.get("/single-vehicle", auth, singleVehicle)
router.put("/update-vehicle", auth, updateVehicle)
router.delete("/delete-vehicle", auth, deleteVehicle)

module.exports = router
