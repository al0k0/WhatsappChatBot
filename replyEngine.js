const loadCourses = require("./services/dataStore");
const matchCourse = require("./services/matchCourse");
const messageStore = require("./services/messageStore");
const clickMap = require("./services/clickMap");
async function replyEngine(msg) {

  const text = msg.body.toLowerCase().trim();
  const courses = await loadCourses();
  const phone = msg.from.replace("@c.us","");

  // 👋 Greeting
  if (["hi","hello","hey"].includes(text)) {
    return `
👋 Hi!

Looking to build job-ready skills?

I can help you choose the right course 🙂

Reply *YES* to explore programs.
`;
  }

  // 📚 Show courses
  if (/^yes$/i.test(text)) {

    messageStore[msg.from] = {
      course: null,
      replied: false,
      reminderCount: 0,
      lastSent: Date.now(),
      read: false,
      delivered: false
    };

    if (!courses || courses.length === 0) {
      return "⚙ Courses are being updated. Please try again shortly 🙂";
    }

    const list = courses
      .map((c, i) => `${i + 1}️⃣ *${c.name}*`)
      .join("\n");

    return `
📚 *Available Programs*

${list}

✨ Reply with the *course name* to get full details.
`;
  }

  // 🎓 Course selected
  const matched = matchCourse(text, courses);

  if (matched) {

   messageStore[msg.from] = {
  ...(messageStore[msg.from] || {}),
  course: matched.name,
  replied: false,
  reminderCount: 0,
  lastSent: Date.now(),
  read: false,
  delivered: false
};
const id = Math.random().toString(36).substring(2, 7);
clickMap[id] = msg.from;
    return `
🎓 *${matched.name}*

✅ Industry-relevant skills  
✅ Hands-on practical training  
✅ Internship & career guidance  

🔎 *Learn More:*  
${matched.url}

📝 *Apply Now:*  
https://charter-temp.vercel.app/apply
🤝 Need help deciding?  
https://wa.me/91XXXXXXXXXX
`;
  }

  return `
🙂 I can help you explore career programs.

Reply *YES* to view courses.
`;
}

module.exports = replyEngine;