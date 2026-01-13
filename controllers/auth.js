const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");

// ---------------- Register ----------------
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  // 🔐 Role validation
  const allowedRoles = ["admin", "manager", "driver"];
  if (role && !allowedRoles.includes(role)) {
    throw new BadRequestError("Invalid role");
  }

  // 🚫 Prevent normal users from creating admin
  if (req.user?.role === "manager" && role === "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Manager cannot create admin",
    });
  }

  if (req.user?.role === "driver") {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Driver cannot create users",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Email already exists" });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || "driver", // default role
  });

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

// ---------------- Login ----------------
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

// ---------------- Get All Users ----------------
const getAllUsers = async (req, res) => {
  const currentRole = req.user.role;

  let users;

  if (currentRole === "admin") {
    users = await User.find().select("-password");
  } else if (currentRole === "manager") {
    users = await User.find({ role: "driver" }).select("-password");
  } else {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Access denied",
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    users,
  });
};

// ---------------- Delete User ----------------
const deleteUser = async (req, res) => {
  const currentRole = req.user.role;
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "User not found" });
  }

  // 🔐 Delete rules
  if (currentRole === "admin") {
    await targetUser.deleteOne();
  } else if (currentRole === "manager" && targetUser.role === "driver") {
    await targetUser.deleteOne();
  } else {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "You are not allowed to delete this user",
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User deleted successfully",
  });
};
// ================= MANAGER REPORTS (AGGREGATION) =================

// 🔹 Total Managers
const totalManagers = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: "manager" } },
      { $count: "totalManagers" }
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      totalManagers: result[0]?.totalManagers || 0,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Active vs Inactive Managers
const managerStatusReport = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: "manager" } },
      {
        $group: {
          _id: "$active", // true / false
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Monthly Manager Report
const monthlyManagerReport = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: "manager" } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      report: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  getAllUsers,
  deleteUser,
  totalManagers,
  managerStatusReport,
  monthlyManagerReport
};
