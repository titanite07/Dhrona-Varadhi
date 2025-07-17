// linkedin-scraper.js - Advanced LinkedIn scraper with extreme anti-detection measures
// ⚠️ WARNING: LinkedIn has very aggressive anti-bot detection. This is for educational purposes only.
// Real production use would require residential proxies, advanced stealth techniques, and may still fail.

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const isDebug = process.env.PUPPETEER_DEBUG === 'true';

// Extended User-Agent rotation for LinkedIn
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
];

// Helper function for human-like random delays
const randomDelay = async (min = 3000, max = 8000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Helper function to get random user agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Simulate human-like mouse movements
const simulateHumanMovement = async (page) => {
  await page.mouse.move(
    Math.random() * 800 + 100,
    Math.random() * 600 + 100,
    { steps: 10 }
  );
  await randomDelay(500, 1500);
};

// Simulate human-like scrolling
const simulateHumanScrolling = async (page) => {
  const scrollSteps = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() * 300 + 100);
    });
    await randomDelay(1000, 3000);
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

// Handle LinkedIn popups and security challenges
const handleLinkedInPopups = async (page) => {
  const popupSelectors = [
    // Common popup close buttons
    '[data-testid="close-button"]',
    '.modal-close',
    '.popup-close',
    '[aria-label="Close"]',
    '.close-button',
    // LinkedIn specific
    '[data-testid="modal-close"]',
    '.modal__close',
    '.popup__close',
    // Security challenges
    '[data-testid="challenge-dismiss"]',
    '.challenge-dismiss',
    // Cookie consent
    '[data-testid="cookie-banner-close"]',
    '.cookie-banner__close',
    // Email verification
    '[data-testid="email-verification-close"]',
    '.email-verification__close'
  ];
  
  for (const selector of popupSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 2000 });
      await page.click(selector);
      await randomDelay(1000, 2000);
      console.log(`Closed popup with selector: ${selector}`);
    } catch (e) {
      // Popup not found, continue
    }
  }
};

// Main LinkedIn scraper function (ADVANCED - Use with caution)
async function scrapeLinkedIn() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting LinkedIn scraper (ADVANCED MODE)...');
    console.log('⚠️  WARNING: LinkedIn has aggressive anti-bot measures');
    
    // Launch browser with extreme stealth mode
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
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Speed up loading
        '--disable-javascript', // LinkedIn may not work without JS
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    page = await browser.newPage();
    
    // Set random user agent
    await page.setUserAgent(getRandomUserAgent());
    
    // Set extra headers to appear more human-like
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1'
    });

    // Listen for console messages for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Navigate to LinkedIn jobs page
    console.log('📄 Navigating to LinkedIn jobs...');
    await page.goto('https://www.linkedin.com/jobs/', {
      waitUntil: 'networkidle2',
      timeout: 60000 // Longer timeout for LinkedIn
    });
    
    await randomDelay(5000, 10000);

    // Simulate human-like behavior
    console.log('🤖 Simulating human-like behavior...');
    await simulateHumanMovement(page);
    await simulateHumanScrolling(page);

    // Handle popups and security challenges
    console.log('🔧 Handling popups and security challenges...');
    await handleLinkedInPopups(page);

    // Wait for job listings to load
    console.log('⏳ Waiting for job listings to load...');
    try {
      await page.waitForSelector('[class*="job"], [class*="listing"], [data-testid*="job"]', { 
        timeout: 30000 
      });
    } catch (e) {
      console.log('Job listings selector not found, continuing...');
    }

    // Scroll to load more content with human-like behavior
    console.log('📜 Scrolling to load more content...');
    for (let i = 0; i < 3; i++) {
      await simulateHumanScrolling(page);
      await randomDelay(3000, 6000);
    }

    // Extract job opportunities with robust selectors
    console.log('🔍 Extracting job opportunities...');
    const opportunities = await page.evaluate(() => {
      const results = [];
      
      // Multiple selector strategies for different page layouts
      const selectors = [
        // Job cards/containers
        '[class*="job"]',
        '[class*="listing"]',
        '[class*="position"]',
        '[class*="opportunity"]',
        // More specific selectors
        '.job-card',
        '.listing-card',
        '.position-card',
        '[data-testid*="job"]',
        '[data-testid*="listing"]',
        // LinkedIn specific
        '[class*="JobCard"]',
        '[class*="JobListing"]',
        '[class*="job-search-card"]'
      ];

      let elements = [];
      
      // Try each selector strategy
      for (const selector of selectors) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
          elements = Array.from(found);
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          break;
        }
      }

      // If no elements found, try broader approach
      if (elements.length === 0) {
        // Look for any clickable elements that might be job listings
        elements = Array.from(document.querySelectorAll('a[href*="/jobs/"], a[href*="/job/"]'));
        console.log(`Found ${elements.length} potential job links`);
      }

      elements.forEach((element, index) => {
        try {
          // Extract job title
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

          // Extract URL
          let url = '';
          const linkEl = element.tagName === 'A' ? element : element.querySelector('a');
          if (linkEl && linkEl.href) {
            url = linkEl.href;
          }

          // Extract company/organization
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

          // Extract location
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

          // Extract description/summary
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

          // Only add if we have at least a title or company
          if (title || organization !== 'Unknown Company') {
            results.push({
              title: title || `LinkedIn Job ${index + 1}`,
              url: url,
              description: description,
              startDate: '', // Jobs don't typically have start dates
              endDate: '',
              organization: organization,
              type: 'Job',
              source: 'LinkedIn',
              image: '',
              location: location
            });
          }
        } catch (err) {
          console.error('Error processing element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Successfully extracted ${opportunities.length} job opportunities from LinkedIn`);
    return opportunities;

  } catch (error) {
    console.error('❌ Error in LinkedIn scraper:', error.message);
    console.log('💡 LinkedIn scraping is extremely difficult due to aggressive anti-bot measures');
    
    // Take screenshot for debugging
    if (page) {
      await takeScreenshot(page, 'linkedin-error');
    }
    
    // Return demo data as fallback
    return [
      {
        title: 'LinkedIn Job Opportunity (Demo)',
        url: 'https://www.linkedin.com/jobs/',
        description: 'Demo job opportunity from LinkedIn (real scraping blocked by anti-bot measures)',
        startDate: '',
        endDate: '',
        organization: 'Demo Company',
        type: 'Job',
        source: 'LinkedIn',
        image: '',
        location: 'Remote'
      }
    ];
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

module.exports = { scrapeLinkedIn }; 