require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const keepAlive = require('./utils/keepAlive');

// Start Keep-Alive to prevent Render free tier from sleeping
const pingUrl = process.env.RENDER_EXTERNAL_URL || 'https://kaalikahani.onrender.com';
keepAlive(pingUrl);

// Execute Mongo Atlas Connection
connectDB().then(async () => {
  // Auto-seed Super Admin if missing
  const User = require('./models/User');
  const bcrypt = require('bcrypt');
  
  const adminEmail = 'super9140admin@kaalikahani.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password@123', salt);
    
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    console.log('🚀 Super Admin auto-seeded successfully!');
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`KaaliKahani Production Node Environment Live: Port ${PORT} [${process.env.NODE_ENV}]`);
});

// Handle unhandled promise rejections (e.g. invalid MongoDB connections)
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server gracefully
  server.close(() => process.exit(1));
});
