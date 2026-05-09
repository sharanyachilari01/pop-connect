const express = require('express');
const ActivityReport = require('../models/ActivityReport');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const PDFDocument = require('pdfkit');
const { calculateAndGenerate } = require('../utils/honorariumGenerator');

const router = express.Router();

// ACTIVITY REPORTS

// @route   POST /api/reports/activity
// @desc    Submit an activity report (PoP)
// @access  Private
router.post('/activity', protect, async (req, res) => {
  try {
    const { subject, subjectCode, topic, hours } = req.body;
    const report = await ActivityReport.create({
      pop_id: req.user._id,
      subject,
      subjectCode,
      topic,
      hours,
      status: 'SUBMITTED'
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reports/activity
// @desc    Get activity reports
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'PoP' || req.user.role === 'AssistantPoP') {
      query.pop_id = req.user._id;
    }
    
    const reports = await ActivityReport.find(query)
      .populate('pop_id', 'name email role')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/reports/activity/:id/status
// @desc    Update activity report status
// @access  Private
router.put('/activity/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await ActivityReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });

    if (status === 'FACULTY_VERIFIED' && req.user.role !== 'FacultyCoordinator' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (status === 'HOD_APPROVED' && req.user.role !== 'HOD' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    report.status = status;
    await report.save();

    if (status === 'HOD_APPROVED') {
      try {
        const date = report.createdAt || new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        const User = require('../models/User');
        const popUser = await User.findById(report.pop_id);
        const department = 'CSE'; // Could be dynamic if added to user model
        await calculateAndGenerate(report.pop_id, month, year, department);
      } catch (err) {
        console.error('Error auto-generating honorarium:', err);
      }
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reports/activity/pdf
// @desc    Download PDF format of all activity reports
// @access  Private
router.get('/activity/pdf', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'PoP' || req.user.role === 'AssistantPoP') {
      query.pop_id = req.user._id;
    }
    
    const reports = await ActivityReport.find(query).populate('pop_id', 'name');
    
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Activity_Reports.pdf');
    doc.pipe(res);

    doc.fontSize(16).text('Activity Reports Log', { align: 'center' }).moveDown();
    
    // Draw table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('S.No', 30, doc.y, { continued: true, width: 40 });
    doc.text('PoP', 70, doc.y, { continued: true, width: 100 });
    doc.text('Subject', 170, doc.y, { continued: true, width: 100 });
    doc.text('Code', 270, doc.y, { continued: true, width: 70 });
    doc.text('Topic', 340, doc.y, { continued: true, width: 140 });
    doc.text('Hours', 480, doc.y);
    doc.moveDown(0.5);

    doc.moveTo(30, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.5);

    // Draw rows
    doc.font('Helvetica');
    reports.forEach((report, i) => {
      const y = doc.y;
      doc.text(i + 1, 30, y, { continued: true, width: 40 });
      doc.text(report.pop_id?.name || 'N/A', 70, y, { continued: true, width: 100 });
      doc.text(report.subject, 170, y, { continued: true, width: 100 });
      doc.text(report.subjectCode || 'N/A', 270, y, { continued: true, width: 70 });
      doc.text(report.topic, 340, y, { continued: true, width: 140 });
      doc.text(report.hours, 480, y);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error generating PDF' });
  }
});

// @route   POST /api/reports/attendance
// @desc    Log attendance (PoP)
// @access  Private
router.post('/attendance', protect, async (req, res) => {
  try {
    const { date, time, workDone } = req.body;
    const attendance = await Attendance.create({
      pop_id: req.user._id,
      date,
      time,
      workDone
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reports/attendance
// @desc    Get attendance
// @access  Private
router.get('/attendance', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'PoP' || req.user.role === 'AssistantPoP') {
      query.pop_id = req.user._id;
    }
    
    const attendance = await Attendance.find(query)
      .populate('pop_id', 'name email role')
      .sort({ createdAt: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
