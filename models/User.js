const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      maxlength: 50,
      minlength: [2, 'First name is too short'],
      trim: true,
    },
    lastName: {
      type: String,
      required: false, 
      maxlength: 50,
      default: "", 
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false, // Security ke liye fetch karte waqt hide rahega
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'driver'],
      default: 'driver',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance optimization
UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ createdAt: -1 });

/* ================= MIDDLEWARE ================= */

// ✅ FIXED: Modern Async Pre-Save Hook
// Is syntax mein 'next' ki zaroorat nahi hoti, jis se wo "next is not a function" error khatam ho jata hai
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ================= METHODS ================= */

// JWT Generation
UserSchema.methods.createJWT = function () {
  // Safety check for secret key
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
  
  return jwt.sign(
    {
      userId: this._id,
      firstName: this.firstName,
      lastName: this.lastName || "",
      role: this.role,
    },
    secret,
    { expiresIn: process.env.JWT_LIFETIME || '1d' }
  );
};

// Password Comparison
UserSchema.methods.comparePassword = async function (candidatePassword) {
  // Yaad rakhein: is method ke liye query mein password select hona chahiye
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);