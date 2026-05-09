const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    console.log(`Connecting to MongoDB at ${process.env.MONGO_URI || 'mongodb://localhost:27017/popconnect'}...`);
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/popconnect');
    console.log('Connected to MongoDB successfully');

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const existingAdmin = await User.findOne({ email: "admin@vnr.edu" });

    if (!existingAdmin) {
      const admin = await User.create({
        name: "Admin",
        email: "admin@vnr.edu",
        password: hashedPassword,
        role: "Admin"
      });
      console.log('Admin user seeded:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
