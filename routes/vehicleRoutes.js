const express = require("express")
const router = express.Router()
const {
  createVehicle,getAllVehicles,singleVehicle,updateVehicle,deleteVehicle
} = require("../controllers/Vehicle")

router.post("/", createVehicle)
router.get("/", getAllVehicles)
router.get("/:id", singleVehicle)
router.put("/:id", updateVehicle)
router.delete("/:id", deleteVehicle)

module.exports = router
