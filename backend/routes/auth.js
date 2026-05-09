const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for email: ${email}`);
    
    console.log("Entered Email:", email);
    console.log("Entered Password:", password);

    const user = await User.findOne({ email });
    console.log("User Found:", user);
    console.log(`[AUTH] User fetched from DB:`, user ? `Found (ID: ${user._id})` : 'Not found');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH] Password comparison result:`, isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bankVerified: user.bankDetails && user.bankDetails.bankVerified,
      hasBankDetails: !!(user.bankDetails && user.bankDetails.bankName),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(`[AUTH] Server error:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
