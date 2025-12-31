const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = await User.create({
      fullName: 'Super Admin',
      email: 'admin@example.com',
      password: 'adminpassword', // Will be hashed by pre-save hook
      role: 'admin',
      status: 'active'
    });

    console.log('Admin created:', admin.email);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
