import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const openRouterKey = process.env.VITE_OPENROUTER_API_KEY;

  if (!openRouterKey) {
    return res.status(500).json({ error: 'OpenRouter API key is missing on the server' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
        "X-Title": "Manohar Portfolio",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: `You are Manohar Tej's AI assistant. Keep responses under 30 words, friendly, and concise.`
          },
          { role: "user", content: question }
        ],
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      res.json({ answer: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Invalid response from AI provider' });
    }
  } catch (error) {
    console.error("Backend API Error:", error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
