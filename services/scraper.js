const axios = require("axios");
const cheerio = require("cheerio");

async function scraper() {

  const baseUrl = "https://www.w3schools.com/";
  const { data } = await axios.get(baseUrl);

  const $ = cheerio.load(data);

  const courses = [];

  $("#nav_tutorials a").each((i, el) => {
    const name = $(el).text().trim();
    const link = $(el).attr("href");

    if (
      name.includes("HTML") ||
      name.includes("CSS") ||
      name.includes("JavaScript") ||
      name.includes("Python")
    ) {
      courses.push({
        name,
        url: baseUrl + link
      });
    }
  });

  return courses;
}

module.exports = scraper;
