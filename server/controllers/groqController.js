import axios from "axios";

export const chatWithGroq = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "question is required." });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        // llama3-70b-8192 was decommissioned by Groq; keep the model in an env
        // var so the next retirement is a config change, not a redeploy of code.
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful assistant for an AI content platform called Content Genius. very Brief Response" },
          { role: "user", content: question }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;
    res.json({ answer: aiReply });

  } catch (err) {
    console.error("Groq API Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Groq API error",
      details: err.response?.data?.error?.message || err.message,
    });
  }
};
