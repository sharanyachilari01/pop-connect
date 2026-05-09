const mongoose = require('mongoose');

const activityReportSchema = new mongoose.Schema({
  pop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  topic: { type: String, required: true },
  hours: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ['SUBMITTED', 'FACULTY_VERIFIED', 'HOD_APPROVED'],
    default: 'SUBMITTED'
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityReport', activityReportSchema);
