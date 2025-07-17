// leetcode-scraper.js - LeetCode scraper for coding problems and contests
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

// Scrape LeetCode problems
async function scrapeLeetCodeProblems() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting LeetCode problems scraper...');
    
    const isDebug = process.env.PUPPETEER_DEBUG === 'true';
    // Launch browser with stealth mode
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
      'Pragma': 'no-cache'
    });

    // Listen for console messages for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Navigate to LeetCode problems page
    console.log('📄 Navigating to LeetCode problems...');
    await page.goto('https://leetcode.com/problemset/all/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await randomDelay(3000, 6000);

    // Wait for problems table to load
    console.log('⏳ Waiting for problems table to load...');
    try {
      await page.waitForSelector('table, [class*="table"], [class*="problem"]', { 
        timeout: 15000 
      });
    } catch (e) {
      console.log('Problems table selector not found, continuing...');
    }

    // Extract problems with robust selectors
    console.log('🔍 Extracting LeetCode problems...');
    const problems = await page.evaluate(() => {
      const results = [];
      
      // Multiple selector strategies for different page layouts
      const selectors = [
        // Problem rows
        'tr[data-row-key]',
        '[class*="problem"]',
        '[class*="question"]',
        '[class*="row"]',
        // Table rows
        'tbody tr',
        'table tr',
        // More specific selectors
        '.problem-row',
        '.question-row',
        '[data-testid*="problem"]'
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
        // Look for any clickable elements that might be problems
        elements = Array.from(document.querySelectorAll('a[href*="/problems/"]'));
        console.log(`Found ${elements.length} potential problem links`);
      }

      elements.forEach((element, index) => {
        try {
          // Extract problem title
          const titleSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '[class*="title"]',
            '[class*="name"]',
            '.title', '.name',
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

          // Extract difficulty
          const difficultySelectors = [
            '[class*="difficulty"]',
            '[class*="level"]',
            '.difficulty', '.level',
            '[data-testid*="difficulty"]'
          ];
          
          let difficulty = '';
          for (const difficultySelector of difficultySelectors) {
            const difficultyEl = element.querySelector(difficultySelector);
            if (difficultyEl && difficultyEl.textContent.trim()) {
              difficulty = difficultyEl.textContent.trim();
              break;
            }
          }

          // Extract category/tags
          const categorySelectors = [
            '[class*="category"]',
            '[class*="tag"]',
            '[class*="topic"]',
            '.category', '.tag', '.topic'
          ];
          
          let category = '';
          for (const categorySelector of categorySelectors) {
            const categoryEl = element.querySelector(categorySelector);
            if (categoryEl && categoryEl.textContent.trim()) {
              category = categoryEl.textContent.trim();
              break;
            }
          }

          // Only add if we have at least a title
          if (title) {
            results.push({
              title: title,
              url: url,
              description: `LeetCode problem${difficulty ? ` - ${difficulty}` : ''}${category ? ` - ${category}` : ''}`,
              startDate: '',
              endDate: '',
              organization: 'LeetCode',
              type: 'Coding Problem',
              source: 'LeetCode',
              image: '',
              difficulty: difficulty,
              category: category
            });
          }
        } catch (err) {
          console.error('Error processing element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Successfully extracted ${problems.length} problems from LeetCode`);
    return problems;

  } catch (error) {
    console.error('❌ Error in LeetCode problems scraper:', error.message);
    
    // Take screenshot for debugging
    if (page) {
      await takeScreenshot(page, 'leetcode-problems-error');
    }
    
    // Return demo data as fallback
    return [
      {
        title: 'Two Sum (Demo)',
        url: 'https://leetcode.com/problems/two-sum/',
        description: 'Demo LeetCode problem - Easy',
        startDate: '',
        endDate: '',
        organization: 'LeetCode',
        type: 'Coding Problem',
        source: 'LeetCode',
        image: '',
        difficulty: 'Easy',
        category: 'Array'
      }
    ];
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Scrape LeetCode contests
async function scrapeLeetCodeContests() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting LeetCode contests scraper...');
    
    const isDebug = process.env.PUPPETEER_DEBUG === 'true';
    // Launch browser with stealth mode
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
      'Pragma': 'no-cache'
    });

    // Listen for console messages for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Navigate to LeetCode contests page
    console.log('📄 Navigating to LeetCode contests...');
    await page.goto('https://leetcode.com/contest/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await randomDelay(3000, 6000);

    // Wait for contests to load
    console.log('⏳ Waiting for contests to load...');
    try {
      await page.waitForSelector('[class*="contest"], [class*="event"], [class*="competition"]', { 
        timeout: 15000 
      });
    } catch (e) {
      console.log('Contests selector not found, continuing...');
    }

    // Extract contests with robust selectors
    console.log('🔍 Extracting LeetCode contests...');
    const contests = await page.evaluate(() => {
      const results = [];
      
      // Multiple selector strategies for different page layouts
      const selectors = [
        // Contest cards/containers
        '[class*="contest"]',
        '[class*="event"]',
        '[class*="competition"]',
        '[class*="challenge"]',
        // More specific selectors
        '.contest-card',
        '.event-card',
        '.competition-card',
        '[data-testid*="contest"]'
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
        // Look for any clickable elements that might be contests
        elements = Array.from(document.querySelectorAll('a[href*="/contest/"]'));
        console.log(`Found ${elements.length} potential contest links`);
      }

      elements.forEach((element, index) => {
        try {
          // Extract contest title
          const titleSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '[class*="title"]',
            '[class*="name"]',
            '.title', '.name',
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

          // Extract dates
          const dateSelectors = [
            '[class*="date"]',
            '[class*="time"]',
            '[class*="duration"]',
            '.date', '.time', '.duration'
          ];
          
          let startDate = '';
          let endDate = '';
          for (const dateSelector of dateSelectors) {
            const dateEl = element.querySelector(dateSelector);
            if (dateEl && dateEl.textContent.trim()) {
              const dateText = dateEl.textContent.trim();
              // Simple date extraction - could be improved
              if (dateText.includes('to') || dateText.includes('-')) {
                const parts = dateText.split(/to|-/);
                startDate = parts[0]?.trim() || '';
                endDate = parts[1]?.trim() || '';
              } else {
                startDate = dateText;
              }
              break;
            }
          }

          // Extract description
          const descSelectors = [
            '[class*="description"]',
            '[class*="summary"]',
            'p',
            '.description', '.summary'
          ];
          
          let description = '';
          for (const descSelector of descSelectors) {
            const descEl = element.querySelector(descSelector);
            if (descEl && descEl.textContent.trim()) {
              description = descEl.textContent.trim();
              break;
            }
          }

          // Only add if we have at least a title
          if (title) {
            results.push({
              title: title,
              url: url,
              description: description || 'LeetCode coding contest',
              startDate: startDate,
              endDate: endDate,
              organization: 'LeetCode',
              type: 'Coding Contest',
              source: 'LeetCode',
              image: ''
            });
          }
        } catch (err) {
          console.error('Error processing element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Successfully extracted ${contests.length} contests from LeetCode`);
    return contests;

  } catch (error) {
    console.error('❌ Error in LeetCode contests scraper:', error.message);
    
    // Take screenshot for debugging
    if (page) {
      await takeScreenshot(page, 'leetcode-contests-error');
    }
    
    // Return demo data as fallback
    return [
      {
        title: 'LeetCode Weekly Contest (Demo)',
        url: 'https://leetcode.com/contest/',
        description: 'Demo LeetCode coding contest',
        startDate: '',
        endDate: '',
        organization: 'LeetCode',
        type: 'Coding Contest',
        source: 'LeetCode',
        image: ''
      }
    ];
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Scrape LeetCode Discuss for job-related posts
async function scrapeLeetCodeJobs() {
  let browser;
  let page;
  const keywords = [
    'offer', 'intern', 'internship', 'graduate', '2026', '2025', '2024', 'full time', 'ft', 'new grad', 'job', 'hiring', 'placement', 'campus', 'recruit', 'summer', 'winter', 'spring', 'fall'
  ];
  try {
    console.log('🚀 Starting LeetCode Discuss job scraper...');
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
    await page.goto('https://leetcode.com/discuss', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(3000, 6000);
    // Try multiple selectors for posts
    let jobs = [];
    try {
      await page.waitForSelector('a[data-event-action="title"], .discuss-title, .title-link', { timeout: 15000 });
      jobs = await page.evaluate((keywords) => {
        // Try multiple selectors for posts
        const selectors = [
          'a[data-event-action="title"]',
          '.discuss-title',
          '.title-link',
          'a[href*="/discuss/"]'
        ];
        let posts = [];
        for (const selector of selectors) {
          posts = Array.from(document.querySelectorAll(selector));
          if (posts.length > 0) {
            console.log(`Found ${posts.length} posts with selector: ${selector}`);
            break;
          }
        }
        const results = [];
        posts.forEach(post => {
          const title = post.textContent.trim();
          const url = post.href || (post.closest('a') && post.closest('a').href) || '';
          const lowerTitle = title.toLowerCase();
          if (keywords.some(k => lowerTitle.includes(k))) {
            let description = '';
            const row = post.closest('tr') || post.closest('div');
            if (row) {
              const descEl = row.querySelector('td, .content, .post-content, .truncate, .break-all');
              if (descEl) description = descEl.textContent.trim();
            }
            results.push({
              title,
              url,
              description: description || 'Job-related post from LeetCode Discuss',
              startDate: '',
              endDate: '',
              organization: 'LeetCode',
              type: 'Job',
              source: 'LeetCode Discuss',
              image: '',
              location: '',
              salary: '',
              difficulty: '',
              category: ''
            });
          }
        });
        return results;
      }, keywords);
    } catch (e) {
      console.warn('⚠️ No posts found with main selectors:', e.message);
    }
    if (!jobs || jobs.length === 0) {
      console.warn('⚠️ No LeetCode Discuss jobs found. Returning demo job.');
      jobs = [
        {
          title: 'LeetCode Discuss Job (Demo)',
          url: 'https://leetcode.com/discuss',
          description: 'Demo job post from LeetCode Discuss',
          startDate: '',
          endDate: '',
          organization: 'LeetCode',
          type: 'Job',
          source: 'LeetCode Discuss',
          image: '',
          location: '',
          salary: '',
          difficulty: '',
          category: ''
        }
      ];
    }
    console.log(`✅ Successfully extracted ${jobs.length} job posts from LeetCode Discuss`);
    return jobs;
  } catch (error) {
    console.error('❌ Error in LeetCode Discuss job scraper:', error.message);
    if (page) await takeScreenshot(page, 'leetcode-discuss-jobs-error');
    return [
      {
        title: 'LeetCode Discuss Job (Demo)',
        url: 'https://leetcode.com/discuss',
        description: 'Demo job post from LeetCode Discuss',
        startDate: '',
        endDate: '',
        organization: 'LeetCode',
        type: 'Job',
        source: 'LeetCode Discuss',
        image: '',
        location: '',
        salary: '',
        difficulty: '',
        category: ''
      }
    ];
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Main LeetCode scraper function (now only jobs from Discuss)
async function scrapeLeetCode() {
  return await scrapeLeetCodeJobs();
}

module.exports = { scrapeLeetCode }; 