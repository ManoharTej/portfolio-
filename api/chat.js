export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Vercel handles injecting the .env variables natively
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
        "HTTP-Referer": "https://manohar-portfolio.vercel.app", // Adjust if you have a custom domain
        "X-Title": "Manohar Portfolio",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
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
      res.status(200).json({ answer: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Invalid response from AI provider' });
    }
  } catch (error) {
    console.error("Backend API Error:", error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
