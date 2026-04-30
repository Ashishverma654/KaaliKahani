const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/User'); // Fixed path

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database...');

        const email = 'super9140admin@kaalikahani.com'; // CHANGE THIS
        const password = 'Password@123'; // CHANGE THIS

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists!');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            tokenVersion: 0
        });

        console.log('🚀 Super Admin Seeded Successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
