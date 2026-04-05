const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating role to admin if necessary...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user verified.');
    } else {
      console.log('Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created successfully.');
    }

    mongoose.disconnect();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
