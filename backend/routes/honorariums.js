const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Honorarium = require('../models/Honorarium');
const User = require('../models/User');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/honorariums/generate
// @desc    Generate honorarium record for a specific PoP and month
// @access  Private (Admin, FC)
router.post('/generate', protect, authorizeRoles('FacultyCoordinator'), async (req, res) => {
  try {
    const { pop_id, month, department } = req.body;
    const { calculateAndGenerate } = require('../utils/honorariumGenerator');
    const [year, monthStr] = month.split('-');
    
    const honorarium = await calculateAndGenerate(pop_id, monthStr, year, department || 'CSE');
    res.status(201).json(honorarium);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/honorariums
// @desc    Get honorariums
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'PoP' || req.user.role === 'AssistantPoP') {
      query.pop_id = req.user._id;
    }
    
    const records = await Honorarium.find(query)
      .populate('pop_id', 'name email role bankDetails')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/honorariums/:id/status
// @desc    Update honorarium status & payment transaction
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, transactionDetails } = req.body;
    const honorarium = await Honorarium.findById(req.params.id);
    if (!honorarium) return res.status(404).json({ message: 'Not found' });

    if (status === 'FACULTY_VERIFIED' && req.user.role !== 'FacultyCoordinator' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (status === 'HOD_APPROVED' && req.user.role !== 'HOD' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (status === 'PAID') {
      // Typically PoP or FC updates this with transaction details after HOD approval
      honorarium.transactionDetails = transactionDetails || honorarium.transactionDetails;
    }

    honorarium.status = status;
    await honorarium.save();
    
    res.json(honorarium);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/honorariums/:popId/:month/:year
// @desc    Get honorarium details for a specific month
// @access  Private
router.get('/:popId/:month/:year', protect, async (req, res) => {
  try {
    const { popId, month, year } = req.params;
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const honorarium = await Honorarium.findOne({ pop_id: popId, month: monthStr })
      .populate('pop_id', 'name email role bankDetails');
      
    if (!honorarium) return res.status(404).json({ message: 'Honorarium not found' });
    res.json(honorarium);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/honorariums/:id/download
// @desc    Download generated PDF format
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    let honorarium = await Honorarium.findById(req.params.id);
    if (!honorarium) {
      return res.status(404).json({ message: 'Honorarium not found' });
    }

    if (!honorarium.generatedPDFPath || !fs.existsSync(path.join(__dirname, '..', honorarium.generatedPDFPath))) {
      const { calculateAndGenerate } = require('../utils/honorariumGenerator');
      const [year, month] = honorarium.month.split('-');
      honorarium = await calculateAndGenerate(honorarium.pop_id, month, year, honorarium.department);
    }

    const filePath = path.join(__dirname, '..', honorarium.generatedPDFPath);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/honorariums/:id/preview
// @desc    Preview HTML format
// @access  Private
router.get('/:id/preview', protect, async (req, res) => {
  try {
    let honorarium = await Honorarium.findById(req.params.id);
    if (!honorarium) {
      return res.status(404).json({ message: 'Honorarium not found' });
    }

    if (!honorarium.generatedLetterHTML) {
      const { calculateAndGenerate } = require('../utils/honorariumGenerator');
      const [year, month] = honorarium.month.split('-');
      honorarium = await calculateAndGenerate(honorarium.pop_id, month, year, honorarium.department);
    }

    res.send(honorarium.generatedLetterHTML);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
