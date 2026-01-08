const express = require("express");
const router = express.Router();

const { register, login, getAllUsers, deleteUser } = require("../controllers/auth");

// Existing routes
router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);

// ✅ Add this delete route
router.delete("/users/:id", deleteUser);

module.exports = router;
