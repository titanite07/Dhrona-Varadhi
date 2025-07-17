const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const scraperRoutes = require('./scraper');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/opportunities', scraperRoutes);

const bookmarksApi = require('./api/bookmarks');
app.use('/api/bookmarks', bookmarksApi);

const { router: webhooksApi, notifyWebhooks } = require('./api/webhooks');
app.use('/api/webhooks', webhooksApi);

const resumeApi = require('./api/resume');
app.use('/api/resume', resumeApi);

const chatbotApi = require('./api/chatbot');
app.use('/api/chatbot', chatbotApi);

app.get('/', (req, res) => {
  res.send('Opportunity Aggregator Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 