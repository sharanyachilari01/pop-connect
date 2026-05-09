const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/popconnect');
  await User.deleteMany({});
  console.log('All users deleted');
  process.exit();
};

reset();
