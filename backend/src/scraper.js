const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const { scrapeUnstop } = require('./scrapers/unstop-scraper');
const { scrapeGlassdoor } = require('./scrapers/glassdoor-scraper');
const { scrapeLinkedIn } = require('./scrapers/linkedin-scraper');
const { scrapeLeetCode } = require('./scrapers/leetcode-scraper');

const opportunitySchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  startDate: String,
  endDate: String,
  organization: String,
  type: String,
  source: String,
  image: String,
  location: String,
  salary: String,
  difficulty: String,
  category: String,
});
const Opportunity = mongoose.model('Opportunity', opportunitySchema);

async function fetchDevfolio() {
  try {
    const { data } = await axios.get('https://devfolio.co/api/hackathons');
    return data.hackathons.map(h => ({
      title: h.name,
      url: `https://devfolio.co${h.slug}`,
      description: h.short_description,
      startDate: h.starts_at,
      endDate: h.ends_at,
      organization: 'Devfolio',
      type: 'Hackathon',
      source: 'Devfolio',
      image: h.cover_picture,
      location: '',
      salary: '',
      difficulty: '',
      category: ''
    }));
  } catch (err) {
    return [
      {
        title: 'Devfolio Hackathon (Demo)',
        url: 'https://devfolio.co/hackathons',
        description: 'Demo hackathon from Devfolio',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        organization: 'Devfolio',
        type: 'Hackathon',
        source: 'Devfolio',
        image: '',
        location: '',
        salary: '',
        difficulty: '',
        category: ''
      }
    ];
  }
}

async function fetchMLH() {
  try {
    const { data } = await axios.get('https://mlh.io/api/v1/events');
    return data.map(e => ({
      title: e.name,
      url: e.event_site,
      description: e.description,
      startDate: e.start_date,
      endDate: e.end_date,
      organization: e.organization || 'MLH',
      type: 'Hackathon',
      source: 'MLH',
      image: e.image_url,
      location: '',
      salary: '',
      difficulty: '',
      category: ''
    }));
  } catch (err) {
    return [
      {
        title: 'MLH Hackathon (Demo)',
        url: 'https://mlh.io/events',
        description: 'Demo hackathon from MLH',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        organization: 'MLH',
        type: 'Hackathon',
        source: 'MLH',
        image: '',
        location: '',
        salary: '',
        difficulty: '',
        category: ''
      }
    ];
  }
}

async function fetchAllOpportunities() {
  try {
    const results = await Promise.allSettled([
      fetchDevfolio(),
      fetchMLH(),
      scrapeUnstop(),
      scrapeGlassdoor(),
      scrapeLinkedIn(),
      scrapeLeetCode()
    ]);
    const allOpportunities = [];
    const sourceNames = ['Devfolio', 'MLH', 'Unstop', 'Glassdoor', 'LinkedIn', 'LeetCode'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allOpportunities.push(...result.value);
      } else {
        allOpportunities.push({
          title: `${sourceNames[index]} Opportunity (Demo)`,
          url: `https://${sourceNames[index].toLowerCase()}.com`,
          description: `Demo opportunity from ${sourceNames[index]} (scraping failed)`,
          startDate: '',
          endDate: '',
          organization: sourceNames[index],
          type: index < 3 ? 'Hackathon' : index < 5 ? 'Job' : 'Coding Problem',
          source: sourceNames[index],
          image: '',
          location: '',
          salary: '',
          difficulty: '',
          category: ''
        });
      }
    });
    return allOpportunities;
  } catch (error) {
    return [
      {
        title: 'Devfolio Hackathon (Demo)',
        url: 'https://devfolio.co/hackathons',
        description: 'Demo hackathon from Devfolio',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        organization: 'Devfolio',
        type: 'Hackathon',
        source: 'Devfolio',
        image: '',
        location: '',
        salary: '',
        difficulty: '',
        category: ''
      },
      {
        title: 'Glassdoor Job (Demo)',
        url: 'https://www.glassdoor.com/Job/index.htm',
        description: 'Demo job opportunity from Glassdoor',
        startDate: '',
        endDate: '',
        organization: 'Demo Company',
        type: 'Job',
        source: 'Glassdoor',
        image: '',
        location: 'Remote',
        salary: '$50k-80k',
        difficulty: '',
        category: ''
      },
      {
        title: 'LeetCode Problem (Demo)',
        url: 'https://leetcode.com/problems/two-sum/',
        description: 'Demo LeetCode problem - Easy',
        startDate: '',
        endDate: '',
        organization: 'LeetCode',
        type: 'Coding Problem',
        source: 'LeetCode',
        image: '',
        location: '',
        salary: '',
        difficulty: 'Easy',
        category: 'Array'
      }
    ];
  }
}

router.get('/opportunities', async (req, res) => {
  try {
    const opportunities = await fetchAllOpportunities();
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunities', details: err.message });
  }
});

router.get('/devfolio', async (req, res) => {
  try {
    const data = await fetchDevfolio();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Devfolio opportunities', details: err.message });
  }
});

router.get('/mlh', async (req, res) => {
  try {
    const data = await fetchMLH();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MLH opportunities', details: err.message });
  }
});

router.get('/unstop', async (req, res) => {
  try {
    const data = await scrapeUnstop();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Unstop opportunities', details: err.message });
  }
});

router.get('/glassdoor', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const quick = req.query.quick === 'true';
    const data = await scrapeGlassdoor(keyword, quick);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Glassdoor opportunities', details: err.message });
  }
});

router.get('/linkedin', async (req, res) => {
  try {
    const data = await scrapeLinkedIn();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch LinkedIn opportunities', details: err.message });
  }
});

router.get('/leetcode', async (req, res) => {
  try {
    const data = await scrapeLeetCode();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch LeetCode opportunities', details: err.message });
  }
});

router.get('/demo', (req, res) => {
  const demoOpportunities = [
    {
      title: 'Demo Hackathon 1',
      url: 'https://example.com',
      description: 'This is a demo opportunity for testing',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
      organization: 'Demo Org',
      type: 'Hackathon',
      source: 'Demo',
      image: '',
      location: '',
      salary: '',
      difficulty: '',
      category: ''
    },
    {
      title: 'Demo Job Opportunity',
      url: 'https://example.com/job',
      description: 'This is a demo job opportunity',
      startDate: '',
      endDate: '',
      organization: 'Demo Company',
      type: 'Job',
      source: 'Demo',
      image: '',
      location: 'Remote',
      salary: '$60k-90k',
      difficulty: '',
      category: ''
    }
  ];
  res.json(demoOpportunities);
});

router.post('/opportunities/save', async (req, res) => {
  try {
    const opportunities = await fetchAllOpportunities();
    await Opportunity.deleteMany({});
    await Opportunity.insertMany(opportunities);
    res.json({ message: 'Saved opportunities to DB', count: opportunities.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save opportunities', details: err.message });
  }
});

module.exports = router; 