const express = require("express");
const authentication = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// Only logged-in users
router.get(
  "/profile",
  authentication,
  (req, res) => {
    res.json({
      message: "User Profile",
      user: req.user,
    });
  }
);

// Only ADMIN
router.get(
  "/admin",
  authentication,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Admin Access" });
  }
);

// Admin + User
router.get(
  "/dashboard",
  authentication,
  authorizeRoles("admin", "user"),
  (req, res) => {
    res.json({ message: "Dashboard Access" });
  }
);

module.exports = router;
