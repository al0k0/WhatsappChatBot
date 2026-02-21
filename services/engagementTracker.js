const fs = require("fs");

const FILE = "./engagement.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function initUser(phone) {
  const data = load();

  if (!data[phone]) {
    data[phone] = {
      sent: 0,
      delivered: false,
      read: false,
      replied: false,
      clicked: false,
      score: 0,
      level: "COLD",
      lastReply: null
    };
  }

  return data;
}

// ⭐ simple lead scoring
function updateScore(user) {
  let score = 0;

  if (user.read) score += 50;
  if (user.replied) score += 25;
  if (user.clicked) score += 25;

  user.score = score;

  if (score >= 75) user.level = "🔥 HOT";
  else if (score >= 25) user.level = "🙂 WARM";
  else user.level = "❄ COLD";
}
function getAverageScore() {
  const data = load();
  const phones = Object.keys(data);

  if (phones.length === 0) return 0;

  const total = phones.reduce((sum, phone) => {
    return sum + (data[phone].score || 0);
  }, 0);

  const avg100 = total / phones.length;  // out of 100
  const avg10 = avg100 / 10;             // convert to 10 scale

  return Math.round(avg10);              // 7.8 → 8
}
function trackSent(phone) {
  const data = initUser(phone);
  data[phone].sent++;
  save(data);
}

function trackDelivered(phone) {
  const data = initUser(phone);
  data[phone].delivered = true;
  save(data);
}

function trackRead(phone) {
  const data = initUser(phone);
  data[phone].read = true;
  updateScore(data[phone]);
  save(data);
  logUser(phone, data[phone]);
}

function trackReply(phone) {
  const data = initUser(phone);
  data[phone].replied = true;
  data[phone].lastReply = new Date();
  updateScore(data[phone]);
  save(data);
  logUser(phone, data[phone]);
}

function trackClick(phone) {
  const data = initUser(phone);
  data[phone].clicked = true;
  updateScore(data[phone]);
  save(data);
  logUser(phone, data[phone]);
}

function getAllLeads() {
  return load();
}

function logUser(phone, user) {
  console.log(`
📊 Lead Score → ${phone}
Read: ${user.read}
Replied: ${user.replied}
Clicked: ${user.clicked}
Score: ${user.score}
Level: ${user.level}
`);
}

module.exports = {
  trackSent,
  trackDelivered,
  trackRead,
  trackReply,
  trackClick,
  getAllLeads,
   getAverageScore
};