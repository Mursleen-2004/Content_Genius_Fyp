import mongoose from 'mongoose';
import Post from '../models/Post.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const totalPosts = await Post.countDocuments({ createdBy: userId });

    const topTones = await Post.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$tone', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topTopics = await Post.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const recentPosts = await Post.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalPosts,
      topTones,
      topTopics,
      recentPosts,
    });
  } catch (err) {
    console.error(' Dashboard Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};