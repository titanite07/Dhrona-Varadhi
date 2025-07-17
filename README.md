# DhronaVaradhi

*Bridging You to the Best Opportunities*

A beginner-friendly web app that scrapes hackathon, job, and coding opportunity data from multiple sources, stores it in MongoDB, and displays it in a React frontend styled with Tailwind CSS.

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Scraping:** Puppeteer (Unstop, Glassdoor, LinkedIn, LeetCode)
- **Database:** MongoDB Atlas

## Folder Structure
```
DhronaVaradhi/
  backend/
    src/
      scrapers/
        unstop-scraper.js
        glassdoor-scraper.js
        linkedin-scraper.js
        leetcode-scraper.js
      scraper.js
      server.js
      db.js
    .env.example
    package.json
    .gitignore
  frontend/
    public/
      index.html
      ...
    src/
      components/
        OpportunityList.js
        OpportunityCard.js
      App.js
      index.js
      index.css
    tailwind.config.js
    postcss.config.js
    package.json
    .gitignore
  README.md
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd "DhronaVaradhi"
```

### 2. Set Up MongoDB Atlas
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
- Create a database user and get your connection string (replace `<username>`, `<password>`, and `<dbname>`).
- Copy `.env.example` to `.env` in the `backend/` folder and fill in your MongoDB URI.

### 3. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and fill in your MongoDB URI
npm start
```
- The backend runs on [http://localhost:5000](http://localhost:5000)

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```
- The frontend runs on [http://localhost:3000](http://localhost:3000)

## Usage
- The backend will scrape opportunities from multiple sources and store them in MongoDB.
- The frontend fetches and displays the opportunities.

## Notes
- No authentication, notifications, or calendar integration (for simplicity).
- For any issues, check the code comments and this README.

---
Happy Hacking with DhronaVaradhi! 