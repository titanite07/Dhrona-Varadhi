const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

router.post('/', async (req, res) => {
  const { messages } = req.body;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 100,
    });
    res.json({ reply: completion.data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: 'Chatbot error' });
  }
});

module.exports = router;
