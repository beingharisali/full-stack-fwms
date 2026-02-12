const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
// Driver model ko yahan import kiya hai taake dono tables sync rahein
const Driver = require("../models/Driver"); 

/* ================= REGISTER ================= */
const register = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
        throw new BadRequestError("Please provide all values");
    }
    
    if (role === "admin") {
        const isAdminExist = await User.findOne({ role: "admin" });
        if (isAdminExist) {
            return res.status(403).json({
                success: true,
                msg: "admin already exist",
            });
        }
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

/* ================= USERS (Read & Delete) ================= */
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

    // Permission check: Admin sab ko kar sakta hai, Manager sirf drivers ko
    if (
        currentRole === "admin" ||
        (currentRole === "manager" && targetUser.role === "driver")
    ) {
        
        // --- LOGIC FOR SYNC DELETION ---
        if (targetUser.role === "driver") {
            // Driver collection se profile delete karna
            // Note: Hum email ya full name se match kar rahe hain
            await Driver.findOneAndDelete({ 
                $or: [
                    { email: targetUser.email },
                    { name: `${targetUser.firstName} ${targetUser.lastName}` }
                ]
            });
        }

        await targetUser.deleteOne();
    } else {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "You are not allowed to delete this user",
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: "User and associated profile deleted successfully",
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