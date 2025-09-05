import axios from "axios";
import Post from "../models/Post.js";

export const generatePost = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const { topic, tone } = req.body;

  if (!topic || !tone) {
    return res.status(400).json({ error: "Topic and tone are required." });
  }

  if (!req.user?.id) {
    return res
      .status(401)
      .json({ error: "Unauthorized: user not authenticated." });
  }

  const prompt = `Generate a creative social media post for Facebook, Instagram and Twitter. Every platform should have 6 lines each, based on the following tone: ${tone}. The post is engaging and informative. Include relevant hashtags based on the topic: ${topic}.`;

  try {
    console.log("Sending prompt to Gemini:", prompt);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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
      }
    );

    const content = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.log("Gemini responded with no content:", response.data);
      return res
        .status(500)
        .json({ error: "No valid response from Gemini API." });
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
      details: error.response?.data,
    });

    res
      .status(500)
      .json({ error: "Failed to generate post using Gemini API." });
  }
};
