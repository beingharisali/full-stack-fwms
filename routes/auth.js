const express = require("express");
const router = express.Router();

const { register, login, getAllUsers, deleteUser } = require("../controllers/auth");


router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
