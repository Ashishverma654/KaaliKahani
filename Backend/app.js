const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/error');

const cookieParser = require('cookie-parser');

const app = express();

// Initialize Proxy Trust Registry (Required for Render/Deployment identification) map
app.set('trust proxy', 1);

// Security and Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://kaali-kahani-tpkx.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static Content Protocol (Archive Media) map map map
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Injections
const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const progressRoutes = require('./routes/progressRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/progress', progressRoutes);

// Public Heartbeat (No Protection)
const adminController = require('./controllers/adminController');
app.get('/api/settings/public', adminController.getPublicSettings);

// Production Landing Heartbeat (Render/Deploy Fix)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    message: 'KaaliKahani Editorial Registry is online.',
    version: '2.0.4',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler Array (Must be at the bottom of the map)
app.use(errorHandler);

module.exports = app;
