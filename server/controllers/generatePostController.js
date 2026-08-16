import axios from "axios";
import Post from "../models/Post.js";

export const generatePost = async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"; 

    const { topic, tone } = req.body;

    if (!topic || !tone) {
      return res.status(400).json({ error: "Topic and tone are required." });
    }

    if (!req.user?.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not authenticated." });
    }

    const prompt = `Generate a creative social media post for Facebook, Instagram, and Twitter. Each platform should have 6 lines, based on the following tone: ${tone}. Make the post engaging, relevant, and include hashtags about: ${topic}.`;

    console.log("Sending prompt to Gemini:", prompt);

    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(
      API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 20000, 
      }
    );

  
    const content =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      console.error("Gemini responded with no content:", response.data);
      return res.status(500).json({ error: "No valid response from Gemini API." });
    }


    const newPost = new Post({
      topic,
      tone,
      post: content,
      userId: req.user.id,
    });

    await newPost.save();

    res.status(200).json({ post: content });
  } catch (error) {
    console.error("Gemini API Error:", {
      message: error.message,
      details: error.response?.data || error,
    });

    res.status(500).json({
      error: "Failed to generate post using Gemini API.",
      details: error.response?.data?.error?.message || error.message,
    });
  }
};
