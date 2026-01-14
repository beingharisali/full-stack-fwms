const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      maxlength: 50,
      minlength: 3,
      index: true, // 🔹 search / sort optimization
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      maxlength: 50,
      minlength: 3,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,   // ✅ auto index (login fast)
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'driver'],
      default: 'driver',
      index: true, // 🔹 role based filtering fast
    },
  },
  {
    timestamps: true,
  }
);

/* ===================== INDEXES ===================== */

// 🔥 Compound index (very important)
UserSchema.index({ role: 1, createdAt: -1 });

// 🔥 Sorting / reporting
UserSchema.index({ createdAt: -1 });

/* ===================== MIDDLEWARE ===================== */

// Convert email to lowercase before saving
UserSchema.pre("save", function () {
  this.email = this.email.toLowerCase();
});

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ===================== METHODS ===================== */

// Instance method to create JWT
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
