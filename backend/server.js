const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/popconnect')
.then(async () => {
  console.log(`MongoDB connected successfully to ${process.env.MONGO_URI || 'mongodb://localhost:27017/popconnect'}`);
  
  // Auto-create default Super Admin if no Admin exists
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'admin@vnr.edu',
        password: 'admin123',
        role: 'Admin'
      });
      await superAdmin.save();
      console.log('Default Super Admin account created successfully.');
    }
  } catch (error) {
    console.error('Error creating default Super Admin:', error);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/honorariums', require('./routes/honorariums'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
