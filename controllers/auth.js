const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const User = require('../models/User')


const register = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body

   
    if (!firstName || !lastName || !email || !password) {
        throw new BadRequestError('Please provide all values')
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Email already exists' })
    }

 
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role
    })

   
    const token = user.createJWT()

   
    res.status(StatusCodes.CREATED).json({
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        },
        token
    })
}


const login = async (req, res) => {
    const { email, password } = req.body

    
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }

   
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = user.createJWT()

    res.status(StatusCodes.OK).json({
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        },
        token
    })
}
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


module.exports = {
    register,
    login,
    getAllUsers,
}
