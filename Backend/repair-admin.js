require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const repairAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'super9140admin@kaalikahani.com';
    const newPassword = 'Password@123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      { 
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        name: 'Super Admin'
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`✅ Admin account repaired/created: ${user.email}`);
    console.log(`🔑 Password set to: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error repairing admin:', error);
    process.exit(1);
  }
};

repairAdmin();
