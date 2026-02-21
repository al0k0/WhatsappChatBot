require("dotenv").config();
const client = require("./bot");
const MessageMedia = require("whatsapp-web.js").MessageMedia;
const messageStore = require("./services/messageStore");
const tracker = require("./services/engagementTracker");
const generateIntro = require("./services/generateIntro");

const { getNewLeads, markSent } = require("./services/sheetServices");

function delay() {
  return Math.floor(Math.random() * 4000) + 6000; // 6–10 sec
}

async function sendBulk() {

  const poster = MessageMedia.fromFilePath("./poster.jpeg");

  const leads = await getNewLeads();

  if (!leads.length) {
    console.log("No new leads found");
    return;
  }

  console.log("Sending to", leads.length, "users");

  for (let row of leads) {

    const user = row._rawData[0] + "@c.us";

    try {

      // ⭐ generate unique intro
      let msg = await generateIntro();

      if (!msg || msg.length < 20) {
        msg = `Admissions open for job-ready tech programs.
Reply YES to know more.`;
      }

      msg = msg
        .replace(/["']/g, "")
        .replace(/Here's.*message:/i, "")
        .trim();

      await client.sendMessage(user, poster, { caption: msg });

      tracker.trackSent(user);

      // reminder tracking state
      messageStore[user] = {
        sent: true,
        delivered: false,
        read: false,
        replied: false,
        reminderCount: 0,
        lastSent: Date.now(),
        firstSent: Date.now()
      };

      await markSent(row);   // ✅ mark as sent in sheet

      console.log("Sent:", user);

      await new Promise(r => setTimeout(r, delay()));

    } catch (err) {
      console.log("Send error:", user, err.message);
    }
  }
}

module.exports = {sendBulk, messageStore};