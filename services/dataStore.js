const scraper = require("./scraper");

let cachedCourses = null;
let lastFetchTime = 0;

const CACHE_DURATION = 1000 * 60 * 60 * 6;

async function loadCourses() {
  const now = Date.now();

  if (!cachedCourses || now - lastFetchTime > CACHE_DURATION) {
    try {
      console.log("🔄 Refreshing course cache...");
      cachedCourses = await scraper();
      lastFetchTime = now;
      console.log("✅ Courses loaded:", cachedCourses.length);
    } catch (err) {
      console.log("❌ Scraper failed:", err.message);
      return cachedCourses || [];
    }
  }

  return cachedCourses;
}

module.exports = loadCourses;
