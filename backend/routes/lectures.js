const express = require('express');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/lectures
// @desc    Create a new lecture (FC only)
// @access  Private
router.post('/', protect, authorizeRoles('FacultyCoordinator'), async (req, res) => {
  try {
    const { topic, subject, subjectCode, date, assigned_to } = req.body;
    console.log("Request Body:", req.body);
    console.log("User:", req.user);
    const lecture = await Lecture.create({
      topic,
      subject,
      subjectCode,
      date,
      created_by: req.user._id,
      assigned_to,
      status: 'PENDING'
    });
    res.status(201).json(lecture);
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/lectures
// @desc    Get lectures based on role
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'PoP' || req.user.role === 'AssistantPoP') {
      query.assigned_to = req.user._id;
    } else if (req.user.role === 'FacultyCoordinator') {
      query.created_by = req.user._id;
    }
    // Admin and HOD see all lectures

    const lectures = await Lecture.find(query)
      .populate('assigned_to', 'name email role')
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/lectures/:id/status
// @desc    Update lecture status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    // Status Validations
    if ((status === 'POP_APPROVED' || status === 'POP_REJECTED') && 
        (req.user.role !== 'PoP' && req.user.role !== 'AssistantPoP' && req.user.role !== 'Admin')) {
      return res.status(403).json({ message: 'Unauthorized status transition' });
    }

    if ((status === 'HOD_APPROVED' || status === 'HOD_REJECTED') && 
        (req.user.role !== 'HOD' && req.user.role !== 'Admin')) {
      return res.status(403).json({ message: 'Unauthorized status transition' });
    }

    if (status === 'CONDUCTED' && 
        (req.user.role !== 'PoP' && req.user.role !== 'AssistantPoP' && req.user.role !== 'FacultyCoordinator' && req.user.role !== 'Admin')) {
      return res.status(403).json({ message: 'Unauthorized status transition' });
    }

    lecture.status = status;
    await lecture.save();
    
    res.json(lecture);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
