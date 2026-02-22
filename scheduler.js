const cron = require("node-cron");
const client = require("./bot");
const MessageMedia = require("whatsapp-web.js").MessageMedia;
const tracker = require("./services/engagementTracker");
const store = require("./services/messageStore");
const generateFollowup = require("./services/aiFollowup");

const poster = MessageMedia.fromFilePath("./poster.jpeg");

function startReminder() {

  cron.schedule("* * * * *", async () => {

    const users = store.getStore();
    const now = Date.now();

    for (let user in users) {

      const s = users[user];
      const diff = now - s.lastSent;
      if (diff < 60 * 1000) continue;

      const status = tracker.getStatus(user);

      const seen = status?.read;
      const question = status?.lastQuestion;
      const course = status?.courseName || "the program";

      let caption;

      // ===== SESSION 1 → 2 =====
      if (s.session === 1) {

        const context = question
          ? `User asked: ${question}`
          : seen
          ? "User saw message but did not respond"
          : "User may have missed the previous message";

        caption = await generateFollowup(context, course, user);

        await client.sendMessage(user, poster, { caption });

        tracker.completeSession(user);
        store.updateUser(user, { session: 2, lastSent: now });
      }

      // ===== SESSION 2 → 3 =====
      else if (s.session === 2) {

        const context = question
          ? `User showed interest in: ${question}`
          : "Final reminder to respond";

        caption = await generateFollowup(context, course, user);

        await client.sendMessage(user, poster, { caption });

        tracker.completeSession(user);
        store.updateUser(user, { session: 3, lastSent: now });
      }

      // ===== FINAL =====
      else {
        tracker.completeSession(user);
        store.deleteUser(user);
        continue;
      }

      console.log("Sent session", s.session + 1, "to", user);
    }

  });
}

module.exports = startReminder;