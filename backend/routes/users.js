const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin view)
// @access  Private (Admin, FC)
router.get('/', protect, authorizeRoles('FacultyCoordinator'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin, FC)
router.post('/', protect, authorizeRoles('FacultyCoordinator'), async (req, res) => {
  try {
    const { name, email, password, role, honorariumRate } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name, email, password, role, honorariumRate
    });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Promote/demote user
// @access  Private (Admin, FC)
router.put('/:id/role', protect, authorizeRoles('FacultyCoordinator'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (user) {
      if (role) user.role = role;
      
      // Auto-update base rate on role change (fallback if not provided manually later)
      if (role === 'PoP') user.honorariumRate = 10000;
      if (role === 'AssistantPoP') user.honorariumRate = 5000;
      
      const updatedUser = await user.save();
      res.json({ _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, honorariumRate: updatedUser.honorariumRate });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/:id/rate
// @desc    Update honorarium rate explicitly
// @access  Private (Admin, FC)
router.put('/:id/rate', protect, authorizeRoles('FacultyCoordinator'), async (req, res) => {
  try {
    const { honorariumRate } = req.body;
    if (honorariumRate === undefined || isNaN(Number(honorariumRate))) {
      return res.status(400).json({ message: 'Valid honorariumRate required' });
    }
    
    const user = await User.findById(req.params.id);
    if (user) {
      user.honorariumRate = Number(honorariumRate);
      const updatedUser = await user.save();
      res.json({ _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, honorariumRate: updatedUser.honorariumRate });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/me/bank-details
// @desc    Self-update bank details for PoP/AssPoP
// @access  Private
router.put('/me/bank-details', protect, async (req, res) => {
  try {
    const { bankName, accountNumber, IFSC } = req.body;
    console.log('[BANK DETAILS] Received payload:', req.body);
    
    // Extract user from JWT via req.user._id (protect middleware binds full user object)
    const userToUpdate = await User.findById(req.user._id);
    
    if (!userToUpdate) return res.status(404).json({ message: 'User not found' });
    
    // As per requirement: store them and reset verification state to false
    userToUpdate.bankDetails = {
      bankName,
      accountNumber,
      IFSC,
      bankVerified: false
    };

    const updatedUser = await userToUpdate.save();
    console.log('[BANK DETAILS] Updated User:', updatedUser.bankDetails);
    
    res.json({ message: 'Bank details saved successfully', user: updatedUser });
  } catch (error) {
    console.error('[BANK DETAILS] Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
