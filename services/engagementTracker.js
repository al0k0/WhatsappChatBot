const fs = require("fs");
const FILE = "./engagement.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function init(phone) {
  const data = load();

  if (!data[phone]) {
    data[phone] = {
      session: 1,
      read: false,
      replied: false,
      clicked: false,
      score: 0,
      level: "COLD"
    };
    save(data);
  }

  return data;
}

function trackRead(phone) {
  const data = init(phone);
  if (!data[phone].read) {
    data[phone].read = true;
    save(data);
  }
}

function trackReply(phone) {
  const data = init(phone);
  if (!data[phone].replied) {
    data[phone].replied = true;
    save(data);
  }
}

function trackClick(phone) {
  const data = init(phone);
  if (!data[phone].clicked) {
    data[phone].clicked = true;
    save(data);
  }
}

function trackCourseView(phone, course){
  const data = init(phone);
  data[phone].courseViewed = true;
  data[phone].courseName = course;
  save(data);
}

function saveLastQuestion(phone, text){
  const data = init(phone);
  data[phone].lastQuestion = text;
  save(data);
}

function completeSession(phone) {
  const data = init(phone);
  const u = data[phone];

  let sessionScore = 0;

  if (u.read) sessionScore += 11;
  if (u.replied) sessionScore += 11;
  if (u.clicked) sessionScore += 11;

 u.score += sessionScore;
u.finalScore = Math.round(u.score / 10);

  u.read = false;
  u.replied = false;
  u.clicked = false;

  if (u.session < 3) {
    u.session++;
  } else {
    u.level =
      u.score >= 8 ? "HOT" :
      u.score >= 5 ? "WARM" :
      "COLD";
  }

  save(data);
}

function scoreOutof10(phone){
  const data = load();
  const user = data[phone];

  if(!user) return 0;

  return Math.round(user.score / 10);
}

function getStatus(phone){
  const data = load();
  return data[phone] || null;
}

module.exports = {
  trackRead,
  trackReply,
  trackClick,
  trackCourseView,
  saveLastQuestion,
  completeSession,
  getStatus,
  scoreOutof10
};