const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('./models/Story');
const User = require('./models/User');
const Comment = require('./models/Comment');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const totalStories = await Story.countDocuments();
    console.log('totalStories:', totalStories);
    
    const pendingStories = await Story.countDocuments({ status: 'pending' });
    console.log('pendingStories:', pendingStories);
    
    const totalUsers = await User.countDocuments();
    console.log('totalUsers:', totalUsers);
    
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log('activeUsers:', activeUsers);
    
    const totalComments = await Comment.countDocuments();
    console.log('totalComments:', totalComments);
    
  } catch (err) {
    console.error('Error during counts:', err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
