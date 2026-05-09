const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  date: { type: Date, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Faculty Coordinator
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // PoP or AssistantPoP
  status: { 
    type: String, 
    required: true, 
    enum: ['PENDING', 'POP_APPROVED', 'POP_REJECTED', 'HOD_APPROVED', 'HOD_REJECTED', 'CONDUCTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Lecture', lectureSchema);
