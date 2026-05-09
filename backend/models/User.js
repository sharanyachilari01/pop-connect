const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['Admin', 'FacultyCoordinator', 'PoP', 'AssistantPoP', 'HOD'] 
  },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    IFSC: { type: String, default: '' },
    bankVerified: { type: Boolean, default: false }
  },
  honorariumRate: { type: Number }
}, { timestamps: true });

// Pre-save to hash password and set default honorarium rate if not set
userSchema.pre('save', async function() {
  if (this.isModified('password') && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isNew || this.isModified('role')) {
    if (this.role === 'PoP' && !this.honorariumRate) {
      this.honorariumRate = 10000;
    } else if (this.role === 'AssistantPoP' && !this.honorariumRate) {
      this.honorariumRate = 5000;
    }
  }
});

// Method to check password validity
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
