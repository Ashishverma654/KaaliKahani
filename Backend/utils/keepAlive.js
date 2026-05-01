const https = require('https');

const keepAlive = (url) => {
  if (!url) return;
  
  // Ping every 14 minutes (Render spins down after 15 minutes of inactivity)
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`Keep-alive ping sent to ${url}. Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Keep-alive ping failed: ${err.message}`);
    });
  }, 14 * 60 * 1000); 
};

module.exports = keepAlive;
