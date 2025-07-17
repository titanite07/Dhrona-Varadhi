// glassdoor-scraper.js - Robust Glassdoor scraper with anti-detection measures
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
const randomDelay = async (min = 2000, max = 5000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Helper function to get random user agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Helper function to scroll and wait for content
const scrollAndWaitForContent = async (page, maxScrolls = 3) => {
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await randomDelay(3000, 6000);
    
    // Check if new content loaded
    const previousHeight = await page.evaluate(() => document.body.scrollHeight);
    await randomDelay(2000, 4000);
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

// Handle Glassdoor popups and modals
const handleGlassdoorPopups = async (page) => {
  const popupSelectors = [
    // Common popup close buttons
    '[data-testid="close-button"]',
    '.modal-close',
    '.popup-close',
    '[aria-label="Close"]',
    '.close-button',
    // Glassdoor specific
    '[data-testid="modal-close"]',
    '.modal__close',
    '.popup__close',
    // Cookie consent
    '[data-testid="cookie-banner-close"]',
    '.cookie-banner__close',
    // Email signup popups
    '[data-testid="email-signup-close"]',
    '.email-signup__close'
  ];
  
  for (const selector of popupSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 3000 });
      await page.click(selector);
      await randomDelay(1000, 2000);
      console.log(`Closed popup with selector: ${selector}`);
    } catch (e) {
      // Popup not found, continue
    }
  }
};


const TRENDING_KEYWORDS = [
  'software', 'developer', 'engineer', 'data', 'ai', 'machine learning'
];

// Main Glassdoor scraper function
async function scrapeGlassdoor(keyword = null, quick = false) {
  let browser;
  let page;
  let allJobs = [];
  try {
    console.log('🚀 Starting Glassdoor scraper...');
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
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled'
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
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    });
    if (quick) {
      // Quick mode: fetch 6 jobs from the default Glassdoor jobs page
      const searchUrl = 'https://www.glassdoor.co.in/Job/jobs.htm';
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await randomDelay(4000, 7000);
      await handleGlassdoorPopups(page);
      try {
        await page.waitForSelector('[class*="job"], [class*="listing"], [data-testid*="job"]', { timeout: 15000 });
      } catch (e) {
        console.log('Job listings selector not found, continuing...');
      }
      await scrollAndWaitForContent(page, 1);
      const jobs = await page.evaluate(() => {
        const results = [];
        const selectors = [
          '[class*="job"]',
          '[class*="listing"]',
          '[class*="position"]',
          '[class*="opportunity"]',
          '.job-card',
          '.listing-card',
          '.position-card',
          '[data-testid*="job"]',
          '[data-testid*="listing"]',
          '[class*="JobCard"]',
          '[class*="JobListing"]'
        ];
        let elements = [];
        for (const selector of selectors) {
          const found = document.querySelectorAll(selector);
          if (found.length > 0) {
            elements = Array.from(found);
            break;
          }
        }
        if (elements.length === 0) {
          elements = Array.from(document.querySelectorAll('a[href*="/job/"], a[href*="/position/"]'));
        }
        elements.forEach((element, index) => {
          try {
            const titleSelectors = [
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              '[class*="title"]',
              '[class*="position"]',
              '[class*="job-title"]',
              '.title', '.position', '.job-title',
              '[data-testid*="title"]'
            ];
            let title = '';
            for (const titleSelector of titleSelectors) {
              const titleEl = element.querySelector(titleSelector);
              if (titleEl && titleEl.textContent.trim()) {
                title = titleEl.textContent.trim();
                break;
              }
            }
            if (!title) return;
            let url = '';
            const linkEl = element.tagName === 'A' ? element : element.querySelector('a');
            if (linkEl && linkEl.href) {
              url = linkEl.href;
            }
            const companySelectors = [
              '[class*="company"]',
              '[class*="employer"]',
              '[class*="organization"]',
              '.company', '.employer', '.organization',
              '[data-testid*="company"]'
            ];
            let organization = 'Unknown Company';
            for (const companySelector of companySelectors) {
              const companyEl = element.querySelector(companySelector);
              if (companyEl && companyEl.textContent.trim()) {
                organization = companyEl.textContent.trim();
                break;
              }
            }
            const locationSelectors = [
              '[class*="location"]',
              '[class*="city"]',
              '[class*="address"]',
              '.location', '.city', '.address',
              '[data-testid*="location"]'
            ];
            let location = '';
            for (const locationSelector of locationSelectors) {
              const locationEl = element.querySelector(locationSelector);
              if (locationEl && locationEl.textContent.trim()) {
                location = locationEl.textContent.trim();
                break;
              }
            }
            const descSelectors = [
              '[class*="description"]',
              '[class*="summary"]',
              '[class*="snippet"]',
              'p',
              '.description', '.summary', '.snippet'
            ];
            let description = '';
            for (const descSelector of descSelectors) {
              const descEl = element.querySelector(descSelector);
              if (descEl && descEl.textContent.trim()) {
                description = descEl.textContent.trim();
                break;
              }
            }
            const salarySelectors = [
              '[class*="salary"]',
              '[class*="compensation"]',
              '[class*="pay"]',
              '.salary', '.compensation', '.pay'
            ];
            let salary = '';
            for (const salarySelector of salarySelectors) {
              const salaryEl = element.querySelector(salarySelector);
              if (salaryEl && salaryEl.textContent.trim()) {
                salary = salaryEl.textContent.trim();
                break;
              }
            }
            results.push({
              title: title,
              url: url,
              description: description,
              startDate: '',
              endDate: '',
              organization: organization,
              type: 'Job',
              source: 'Glassdoor',
              image: '',
              location: location,
              salary: salary
            });
          } catch (err) {
            // Ignore element errors
          }
        });
        return results;
      });
      allJobs.push(...jobs.slice(0, 6));
      await browser.close();
      return allJobs;
    }
    // Determine keywords to use
    const keywordsToSearch = keyword ? [keyword] : TRENDING_KEYWORDS;
    for (const kw of keywordsToSearch) {
      const searchUrl = `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodeURIComponent(kw)}`;
      console.log(`🔎 Searching Glassdoor for jobs with keyword: ${kw}`);
      try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(4000, 7000);
        // Handle popups and modals
        await handleGlassdoorPopups(page);
        // Wait for job listings to load
        try {
          await page.waitForSelector('[class*="job"], [class*="listing"], [data-testid*="job"]', { timeout: 15000 });
        } catch (e) {
          console.log('Job listings selector not found, continuing...');
        }
        // Scroll to load more content
        await scrollAndWaitForContent(page, 1);
        // Extract job opportunities with robust selectors
        const jobs = await page.evaluate(() => {
          const results = [];
          const selectors = [
            '[class*="job"]',
            '[class*="listing"]',
            '[class*="position"]',
            '[class*="opportunity"]',
            '.job-card',
            '.listing-card',
            '.position-card',
            '[data-testid*="job"]',
            '[data-testid*="listing"]',
            '[class*="JobCard"]',
            '[class*="JobListing"]'
          ];
          let elements = [];
          for (const selector of selectors) {
            const found = document.querySelectorAll(selector);
            if (found.length > 0) {
              elements = Array.from(found);
              break;
            }
          }
          if (elements.length === 0) {
            elements = Array.from(document.querySelectorAll('a[href*="/job/"], a[href*="/position/"]'));
          }
          elements.forEach((element, index) => {
            try {
              const titleSelectors = [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                '[class*="title"]',
                '[class*="position"]',
                '[class*="job-title"]',
                '.title', '.position', '.job-title',
                '[data-testid*="title"]'
              ];
              let title = '';
              for (const titleSelector of titleSelectors) {
                const titleEl = element.querySelector(titleSelector);
                if (titleEl && titleEl.textContent.trim()) {
                  title = titleEl.textContent.trim();
                  break;
                }
              }
              if (!title) return; // Skip if no title found
              let url = '';
              const linkEl = element.tagName === 'A' ? element : element.querySelector('a');
              if (linkEl && linkEl.href) {
                url = linkEl.href;
              }
              const companySelectors = [
                '[class*="company"]',
                '[class*="employer"]',
                '[class*="organization"]',
                '.company', '.employer', '.organization',
                '[data-testid*="company"]'
              ];
              let organization = 'Unknown Company';
              for (const companySelector of companySelectors) {
                const companyEl = element.querySelector(companySelector);
                if (companyEl && companyEl.textContent.trim()) {
                  organization = companyEl.textContent.trim();
                  break;
                }
              }
              const locationSelectors = [
                '[class*="location"]',
                '[class*="city"]',
                '[class*="address"]',
                '.location', '.city', '.address',
                '[data-testid*="location"]'
              ];
              let location = '';
              for (const locationSelector of locationSelectors) {
                const locationEl = element.querySelector(locationSelector);
                if (locationEl && locationEl.textContent.trim()) {
                  location = locationEl.textContent.trim();
                  break;
                }
              }
              const descSelectors = [
                '[class*="description"]',
                '[class*="summary"]',
                '[class*="snippet"]',
                'p',
                '.description', '.summary', '.snippet'
              ];
              let description = '';
              for (const descSelector of descSelectors) {
                const descEl = element.querySelector(descSelector);
                if (descEl && descEl.textContent.trim()) {
                  description = descEl.textContent.trim();
                  break;
                }
              }
              const salarySelectors = [
                '[class*="salary"]',
                '[class*="compensation"]',
                '[class*="pay"]',
                '.salary', '.compensation', '.pay'
              ];
              let salary = '';
              for (const salarySelector of salarySelectors) {
                const salaryEl = element.querySelector(salarySelector);
                if (salaryEl && salaryEl.textContent.trim()) {
                  salary = salaryEl.textContent.trim();
                  break;
                }
              }
              results.push({
                title: title,
                url: url,
                description: description,
                startDate: '',
                endDate: '',
                organization: organization,
                type: 'Job',
                source: 'Glassdoor',
                image: '',
                location: location,
                salary: salary
              });
            } catch (err) {
              // Ignore element errors
            }
          });
          return results;
        });
        allJobs.push(...jobs.slice(0, 5));
        console.log(`✅ Found ${jobs.length} jobs for keyword: ${kw}`);
      } catch (err) {
        console.error(`❌ Error searching Glassdoor for keyword '${kw}':`, err.message);
      }
    }
    console.log(`✅ Successfully extracted ${allJobs.length} job opportunities from Glassdoor (${keyword ? 'single keyword' : 'all keywords'})`);
    return allJobs;
  } catch (error) {
    console.error('❌ Error in Glassdoor scraper:', error.message);
    if (page) {
      await takeScreenshot(page, 'glassdoor-error');
    }
    return [
      {
        title: 'Glassdoor Job Opportunity (Demo)',
        url: 'https://www.glassdoor.com/Job/index.htm',
        description: 'Demo job opportunity from Glassdoor',
        startDate: '',
        endDate: '',
        organization: 'Demo Company',
        type: 'Job',
        source: 'Glassdoor',
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

module.exports = { scrapeGlassdoor }; 