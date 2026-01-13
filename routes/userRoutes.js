const express = require("express");
const authentication = require("../middleware/authentication");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  totalManagers,
  managerStatusReport,
  monthlyManagerReport,
} = require("../controllers/auth");

const router = express.Router();


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

router.get(
  "/admin",
  authentication,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Admin Access" });
  }
);

router.get(
  "/dashboard",
  authentication,
  authorizeRoles("admin", "manager"),
  (req, res) => {
    res.json({ message: "Dashboard Access" });
  }
);



router.get(
  "/reports/managers/total",
  authentication,
  authorizeRoles("admin"),
  totalManagers
);

router.get(
  "/reports/managers/status",
  authentication,
  authorizeRoles("admin"),
  managerStatusReport
);

router.get(
  "/reports/managers/monthly",
  authentication,
  authorizeRoles("admin"),
  monthlyManagerReport
);

module.exports = router;
