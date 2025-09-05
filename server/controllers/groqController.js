import axios from "axios";

export const chatWithGroq = async (req, res) => {
  try {
    const { question } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
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
    console.error(err.message);
    res.status(500).json({ error: "Groq API error" });
  }
};
