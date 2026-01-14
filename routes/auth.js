const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  deleteUser,
  totalManagers,
  usersByRoleReport,
  monthlyManagerReport,
} = require("../controllers/auth");

const authentication = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");

/* ================= AUTH ================= */

// 🔓 Public
router.post("/login", login);

// 🔓 Public (initial signup)
router.post("/register", register);

/* ================= USERS ================= */

// 🔐 Admin → all users, Manager → drivers only
router.get(
  "/users",
  authentication,
  authorizeRoles("admin", "manager"),
  getAllUsers
);

// 🔐 Admin → delete anyone, Manager → delete driver
router.delete(
  "/users/:id",
  authentication,
  authorizeRoles("admin", "manager"),
  deleteUser
);

/* ================= MANAGER REPORTS ================= */

// 🔹 Total managers
router.get(
  "/reports/managers/total",
  authentication,
  authorizeRoles("admin"),
  totalManagers
);

// 🔹 Users by role (Admin / Manager / Driver)
router.get(
  "/reports/users/by-role",
  authentication,
  authorizeRoles("admin"),
  usersByRoleReport
);

// 🔹 Monthly manager report
router.get(
  "/reports/managers/monthly",
  authentication,
  authorizeRoles("admin"),
  monthlyManagerReport
);

module.exports = router;
