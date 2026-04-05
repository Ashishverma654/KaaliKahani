require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Execute Mongo Atlas Connection
connectDB();

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
