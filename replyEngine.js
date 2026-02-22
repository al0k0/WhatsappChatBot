const loadCourses = require("./services/dataStore");
const matchCourse = require("./services/matchCourse");
const messageStore = require("./services/messageStore");
const tracker = require("./services/engagementTracker");   // ⭐ ADD

async function replyEngine(msg) {

  const text = msg.body.trim().toLowerCase();
  const courses = await loadCourses();
  const phone = msg.from.replace("@c.us","");

  // ⭐ SAVE LAST QUESTION
  tracker.saveLastQuestion(msg.from, text);

  // 👋 Greeting
  if (["hi","hello","hey"].includes(text)) {
    return `👋 Hi!

Looking to build job-ready skills?

I can help you choose the right course 🙂

Reply *YES* to explore programs.`;
  }

  // 📚 Show courses
  if (text === "yes") {

    messageStore[msg.from] = {
      course: null,
      lastSent: Date.now()
    };

    if (!courses?.length) {
      return "⚙ Courses are being updated. Please try again shortly 🙂";
    }

    const list = courses
      .map((c, i) => `${i + 1}️⃣ *${c.name}*`)
      .join("\n");

    return `📚 *Available Programs*

${list}

✨ Reply with the *course name* to get full details.`;
  }

  // 🎓 Course selected
  const matched = matchCourse(text, courses);

  if (matched) {

    messageStore[msg.from] = {
      ...(messageStore[msg.from] || {}),
      course: matched.name,
      lastSent: Date.now()
    };

    return `🎓 *${matched.name}*

✅ Industry-relevant skills  
✅ Hands-on practical training  
✅ Internship & career guidance  

🔎 *Learn More:*  
${matched.url}

📝 *Apply Now:*  
https://whatsappchatbot-81iy.onrender.com/a/${phone}

🤝 Need help deciding?  
https://wa.me/91XXXXXXXXXX`;
  }

  return `🙂 I can help you explore career programs.

Reply *YES* to view courses.`;
}

module.exports = replyEngine;