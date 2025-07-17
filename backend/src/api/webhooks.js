const express = require('express');
const router = express.Router();

let webhooks = [];

router.post('/register', (req, res) => {
  const { url } = req.body;
  if (url && !webhooks.includes(url)) webhooks.push(url);
  res.json({ success: true, webhooks });
});

const notifyWebhooks = async (data) => {
  for (const url of webhooks) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      // Log and continue
    }
  }
};

module.exports = { router, notifyWebhooks };
