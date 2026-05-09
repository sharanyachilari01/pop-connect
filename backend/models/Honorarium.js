const mongoose = require('mongoose');

const honorariumSchema = new mongoose.Schema({
  pop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pop: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lecture: { type: String, default: '' },
  month: { type: String, required: true }, // e.g. '04' or 'April' or '2026-04'
  year: { type: String, default: '' },
  totalSessions: { type: Number, required: true },
  ratePerSession: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  totalAmount: { type: Number, default: 0 },
  amountInWords: { type: String, default: '' },
  generatedLetterHTML: { type: String, default: '' },
  generatedPDFPath: { type: String, default: '' },
  hrApprovedBy: { type: String, default: '' },
  status: {
    type: String,
    required: true,
    enum: ['GENERATED', 'FACULTY_VERIFIED', 'HOD_APPROVED', 'PAID'],
    default: 'GENERATED'
  },
  transactionDetails: { type: String, default: '' },
  department: { type: String, default: '' } // Optional, for PDF formatting
}, { timestamps: true });

module.exports = mongoose.model('Honorarium', honorariumSchema);
