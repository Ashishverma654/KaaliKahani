require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admins = await User.find({ role: 'admin' });
    if (admins.length === 0) {
      console.log('No admin users found in the database.');
    } else {
      console.log(`Found ${admins.length} admin(s):`);
      admins.forEach(admin => {
        console.log(`- Name: ${admin.name}, Email: ${admin.email}, isActive: ${admin.isActive}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmins();
