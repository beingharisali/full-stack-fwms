const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  deleteUser,
} = require("../controllers/auth");

const authentication = require("../middleware/authentication");

// ---------------- AUTH ----------------

// 🔓 Public
router.post("/login", login);

// 🔓 Public (for initial signup)
router.post("/register", register);

// 🔐 Get users (Admin → all, Manager → drivers)
router.get("/users", authentication, getAllUsers);

// 🔐 Delete user (Admin → all, Manager → driver only)
router.delete("/users/:id", authentication, deleteUser);

module.exports = router;
