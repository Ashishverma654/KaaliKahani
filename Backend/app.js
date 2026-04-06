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
