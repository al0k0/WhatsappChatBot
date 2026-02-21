const cron = require("node-cron");
const client = require("./bot");
const messageStore = require("./services/messageStore");
const MessageMedia = require("whatsapp-web.js").MessageMedia;
const tracker = require("./services/engagementTracker");
const clickMap = require("./services/clickMap");
// ✅ load poster once (performance)
const poster = MessageMedia.fromFilePath("./poster.jpeg");

function startReminder() {

  // runs every minute (change to */2 for production)
  cron.schedule("* * * * *", async () => {
console.log("⭐ Avg Engagement:", tracker.getAverageScore(), "/ 10");    
const hour = new Date().getHours();

    // 🌙 avoid sending late night reminders
    // if (hour >= 23 || hour < 8) return;

    console.log("⏰ Checking follow-ups...");

    const now = Date.now();

    for (let user in messageStore) {

      const s = messageStore[user];

      // safety checks
      if (!s) continue;
if (s.optOut === true) continue;
      if (s.reminderCount >= 1) continue; // send only once

      // wait time (TEST = 1 min)
      if (now - s.lastSent < 60000) continue;

      try {
const id = Math.random().toString(36).substring(2, 7);
clickMap[id] = user;
        const caption = `
⏰ *Admissions closing soon*

You showed interest in *${s.course || "our career-focused programs"}*.

🎯 Better chances in current round  
🎓 Scholarship opportunities available  

📅 Seats are filling fast.

🟢 *Apply Now:*  
https://charter-temp.vercel.app/apply

📞 Need guidance?  
+91XXXXXXXXXX
`;

        await client.sendMessage(user, poster, { caption });

        tracker.trackSent(user);

        // update tracking
        s.reminderCount++;
        s.lastSent = now;

        console.log("🚨 Urgency reminder sent →", user);

      } catch (err) {
        console.log("Reminder error:", err.message);
      }
    }

  });

}

module.exports = startReminder;