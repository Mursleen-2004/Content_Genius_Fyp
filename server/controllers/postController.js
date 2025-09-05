import mongoose from "mongoose";
import Post from "../models/Post.js";

//  Save a generated post
export const savePost = async (req, res) => {
  try {
    const { topic, tone, post } = req.body;
    const userId = req.user?.id;

    console.log("Received:", { topic, tone, post, userId });

    if (!topic?.trim() || !tone?.trim() || !post?.trim() || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if identical post already exists
    const existingPost = await Post.findOne({
      userId,
      topic: topic.trim(),
      tone: tone.trim(),
      post: post.trim(),
    });

    if (existingPost) {
      return res.status(409).json({ message: "This post already exists." });
    }

    // Save new post
    const newPost = new Post({
      userId,
      topic: topic.trim(),
      tone: tone.trim(),
      post: post.trim(),
    });

    await newPost.save();

    res.status(201).json({
      message: "Post saved successfully.",
      post: newPost,
    });
  } catch (err) {
    console.error("Save post error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

//  Get all posts for the logged-in user
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts." });
  }
};

//  Delete a specific post
export const deletePostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post." });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Server error while deleting post." });
  }
};

// Get analytics of the user's posts
export const getPostAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalPosts = await Post.countDocuments({ userId });

    const toneStats = await Post.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$tone", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const latestPost = await Post.findOne({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      totalPosts,
      toneStats,
      latestPostDate: latestPost?.createdAt || null,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics." });
  }
};
