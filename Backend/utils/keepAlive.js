const https = require('https');

const keepAlive = (url) => {
  if (!url) return;
  
  // Ping every 10 minutes to safely avoid the 15-minute Render sleep threshold
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`Keep-alive ping sent to ${url}. Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Keep-alive ping failed: ${err.message}`);
    });
  }, 10 * 60 * 1000); 
};

module.exports = keepAlive;
