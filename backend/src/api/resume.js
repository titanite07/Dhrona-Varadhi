const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer();

router.post('/parse', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const data = await pdfParse(req.file.buffer);
    const skills = [];
    const keywords = ['python', 'java', 'react', 'node', 'mongodb', 'sql', 'c++', 'javascript', 'aws', 'docker', 'kubernetes'];
    for (const k of keywords) {
      if (data.text.toLowerCase().includes(k)) skills.push(k);
    }
    res.json({ skills });
  } catch (e) {
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

module.exports = router;
