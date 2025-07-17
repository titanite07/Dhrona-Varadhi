const express = require('express');
const router = express.Router();

let bookmarks = []; // For MVP, use in-memory. For production, use MongoDB.

router.get('/', (req, res) => {
  res.json(bookmarks);
});

router.post('/', (req, res) => {
  const { url } = req.body;
  if (url && !bookmarks.includes(url)) bookmarks.push(url);
  res.json({ success: true, bookmarks });
});

router.delete('/', (req, res) => {
  const { url } = req.body;
  bookmarks = bookmarks.filter(b => b !== url);
  res.json({ success: true, bookmarks });
});

module.exports = router;
