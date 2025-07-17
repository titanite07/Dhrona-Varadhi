const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const scraperRoutes = require('./scraper');
app.use('/api/opportunities', scraperRoutes);

const chatbotApi = require('./api/chatbot');
app.use('/api/chatbot', chatbotApi);

app.get('/', (req, res) => {
  res.send('Opportunity Aggregator Backend is running!');
});

module.exports = app;
