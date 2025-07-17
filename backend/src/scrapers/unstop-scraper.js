// unstop-scraper.js - Robust Unstop scraper with anti-detection measures
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// User-Agent rotation for anti-detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Helper function for random delays
const randomDelay = async (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Helper function to get random user agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Helper function to scroll and wait for content
const scrollAndWaitForContent = async (page, maxScrolls = 5) => {
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await randomDelay(2000, 4000);
    
    // Check if new content loaded
    const previousHeight = await page.evaluate(() => document.body.scrollHeight);
    await randomDelay(1000, 2000);
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    
    if (previousHeight === newHeight) {
      break; // No more content to load
    }
  }
};

// Take screenshot on error for debugging
const takeScreenshot = async (page, errorType) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(__dirname, `../screenshots/${errorType}-${timestamp}.png`);
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`Screenshot saved: ${screenshotPath}`);
  } catch (err) {
    console.error('Failed to take screenshot:', err.message);
  }
};

// Main Unstop scraper function
async function scrapeUnstop() {
  let browser;
  let page;
  let allJobs = [];
  try {
    console.log('🚀 Starting Unstop scraper (Job Portal)...');
    const isDebug = process.env.PUPPETEER_DEBUG === 'true';
    browser = await puppeteer.launch({
      headless: isDebug ? false : 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });
    page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    // Go to Unstop job portal
    await page.goto('https://unstop.com/job-portal', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(3000, 6000);
    // Extract job cards
    const jobs = await page.evaluate(() => {
      const results = [];
      const jobCards = document.querySelectorAll('[data-testid*="job-card"], .job-card, .job-listing, a[href*="/jobs/"]');
      jobCards.forEach((card, idx) => {
        try {
          let title = '';
          let url = '';
          let company = '';
          let location = '';
          let description = '';
          let salary = '';
          // Title
          const titleEl = card.querySelector('h3, h2, h1, .job-title, [class*="title"]');
          if (titleEl) title = titleEl.textContent.trim();
          // URL
          const linkEl = card.tagName === 'A' ? card : card.querySelector('a');
          if (linkEl && linkEl.href) url = linkEl.href;
          // Company
          const companyEl = card.querySelector('.company, [class*="company"], [data-testid*="company"]');
          if (companyEl) company = companyEl.textContent.trim();
          // Location
          const locEl = card.querySelector('.location, [class*="location"], [data-testid*="location"]');
          if (locEl) location = locEl.textContent.trim();
          // Description
          const descEl = card.querySelector('.description, .desc, .summary, p, [class*="desc"]');
          if (descEl) description = descEl.textContent.trim();
          // Salary
          const salaryEl = card.querySelector('.salary, [class*="salary"], [data-testid*="salary"]');
          if (salaryEl) salary = salaryEl.textContent.trim();
          if (title && url) {
            results.push({
              title,
              url,
              description,
              startDate: '',
              endDate: '',
              organization: company || 'Unstop',
              type: 'Job',
              source: 'Unstop',
              image: '',
              location,
              salary
            });
          }
        } catch (err) {
          // Ignore element errors
        }
      });
      return results;
    });
    console.log(`✅ Successfully extracted ${jobs.length} jobs from Unstop Job Portal`);
    if (!jobs || jobs.length === 0) {
      console.warn('⚠️ No Unstop jobs found. Returning demo job.');
      allJobs = [
        {
          title: 'Unstop Job Opportunity (Demo)',
          url: 'https://unstop.com/job-portal',
          description: 'Demo job from Unstop Job Portal',
          startDate: '',
          endDate: '',
          organization: 'Unstop',
          type: 'Job',
          source: 'Unstop',
          image: '',
          location: 'Remote',
          salary: ''
        }
      ];
    } else {
      allJobs = jobs;
    }
    return allJobs;
  } catch (error) {
    console.error('❌ Error in Unstop Job Portal scraper:', error.message);
    if (page) await takeScreenshot(page, 'unstop-job-error');
    return [
      {
        title: 'Unstop Job Opportunity (Demo)',
        url: 'https://unstop.com/job-portal',
        description: 'Demo job from Unstop Job Portal',
        startDate: '',
        endDate: '',
        organization: 'Unstop',
        type: 'Job',
        source: 'Unstop',
        image: '',
        location: 'Remote',
        salary: ''
      }
    ];
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

module.exports = { scrapeUnstop }; 