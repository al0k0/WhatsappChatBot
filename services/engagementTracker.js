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
      finalScore: 0,
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

    console.log("\n👀 READ EVENT");
    console.log("User:", phone);
  }
}

function trackReply(phone) {
  const data = init(phone);

  if (!data[phone].replied) {
    data[phone].replied = true;
    save(data);

    console.log("\n💬 REPLY EVENT");
    console.log("User:", phone);
  }
}

function trackClick(phone) {
  const data = init(phone);

  if (!data[phone].clicked) {
    data[phone].clicked = true;
    save(data);

    console.log("\n🌐 CLICK EVENT");
    console.log("User:", phone);
  }
}

function trackCourseView(phone, course) {
  const data = init(phone);
  data[phone].courseViewed = true;
  data[phone].courseName = course;
  save(data);
}

function saveLastQuestion(phone, text) {
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

  // convert to /10 scale
  u.finalScore = Math.round(u.score / 10);

  // level based on finalScore
  u.level =
    u.finalScore >= 8 ? "HOT" :
    u.finalScore >= 5 ? "WARM" :
    "COLD";

  console.log(`
📊 USER ENGAGEMENT
${phone}
   session     : ${u.session}
   read        : ${u.read}
   replied     : ${u.replied}
   clicked     : ${u.clicked}
   sessionScore: ${sessionScore}
   totalScore  : ${u.score}
   finalScore  : ${u.finalScore}/10
   level       : ${u.level}
────────────────────────
`);

  // reset session flags
  u.read = false;
  u.replied = false;
  u.clicked = false;

  if (u.session < 3) {
    u.session++;
  }

  save(data);
}

function scoreOutof10(phone) {
  const data = load();
  const user = data[phone];
  if (!user) return 0;
  return user.finalScore || 0;
}

function getStatus(phone) {
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