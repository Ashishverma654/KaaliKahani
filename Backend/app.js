const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/error');

const cookieParser = require('cookie-parser');

const app = express();

// Security and Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Route Injections
const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);

// Public Heartbeat (No Protection)
const adminController = require('./controllers/adminController');
app.get('/api/settings/public', adminController.getPublicSettings);

// Global Error Handler Array (Must be at the bottom of the map)
app.use(errorHandler);

module.exports = app;
