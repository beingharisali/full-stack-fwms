const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");

/* ================= REGISTER ================= */
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  // 🔐 BLOCK ADMIN CREATION
  if (role === "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Admin creation is not allowed",
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Email already exists",
    });
  }

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role: role || "driver",
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

/* ================= LOGIN ================= */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  // 🔐 SINGLE ADMIN LOGIN ONLY
  if (
    user.role === "admin" &&
    user.email !== process.env.SUPER_ADMIN_EMAIL
  ) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Unauthorized admin access",
    });
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

/* ================= USERS ================= */
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

const deleteUser = async (req, res) => {
  const currentRole = req.user.role;
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "User not found",
    });
  }

  if (
    currentRole === "admin" ||
    (currentRole === "manager" && targetUser.role === "driver")
  ) {
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

/* ================= REPORTS ================= */
const totalManagers = async (req, res) => {
  const result = await User.aggregate([
    { $match: { role: "manager" } },
    { $count: "totalManagers" },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    totalManagers: result[0]?.totalManagers || 0,
  });
};

const usersByRoleReport = async (req, res) => {
  const result = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    report: result,
  });
};

const monthlyManagerReport = async (req, res) => {
  const result = await User.aggregate([
    { $match: { role: "manager" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    report: result,
  });
};

module.exports = {
  register,
  login,
  getAllUsers,
  deleteUser,
  totalManagers,
  usersByRoleReport,
  monthlyManagerReport,
};
