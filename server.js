// load environment variables
require("dotenv").config();

const express = require("express");
const app = express();

const client = require("./bot");

const tracker = require("./services/engagementTracker");
const { sendBulk } = require("./campaign");
const messageStore = require("./services/messageStore");
const replyEngine = require("./replyEngine");
const detectIntent = require("./services/detectIntent");

const trackStatus = require("./tracker");
const startReminder = require("./scheduler");


// =============================
// 🌐 WEBSITE VISIT TRACKING
// =============================
app.get("/w/:phone", (req, res) => {

  const phone = req.params.phone;

  console.log("🌐 Website click:", phone);

  tracker.trackClick(phone);

  res.redirect("https://charter-temp.vercel.app");
});


// =============================
// 🎓 APPLY TRACKING
// =============================
app.get("/a/:phone", (req, res) => {

  const phone = req.params.phone;

  console.log("🎓 Apply click:", phone);

  tracker.trackClick(phone);

  res.redirect("https://charter-temp.vercel.app/apply");
});


// =============================
// OPTIONAL ROOT CHECK
// =============================
app.get("/", (req, res) => {
  res.send("✅ Bot tracking server running");
});


// =============================
// START SERVER LOGIC
// =============================
async function startServer() {

  client.on("ready", async () => {

    console.log("✅ Bot Ready");

    trackStatus(client);
    startReminder();

    console.log("🚀 Starting campaign...");
    sendBulk();

    // check new leads every 3 minutes
    setInterval(() => {
      console.log("🔍 Checking new leads...");
      sendBulk();
    }, 180000);

  });


  // =============================
  // 📩 INCOMING MESSAGES
  // =============================
  client.on("message", async msg => {

    if (msg.fromMe) return;
    if (!msg.from.endsWith("@c.us")) return;

    const text = msg.body.toLowerCase();

    let intentRaw = await detectIntent(text);
    let intent = String(intentRaw || "OTHER").toUpperCase();

    // fallback keywords
    if (/admission|apply|join|fees|enroll/i.test(text)) {
      intent = "ADMISSION";
    }

    // ❌ NEGATIVE → stop reminders
    if (intent === "NEGATIVE") {

      if (messageStore[msg.from]) {
        messageStore[msg.from].optOut = true;
      }

      await client.sendMessage(
        msg.from,
        "👍 Understood. I won't send more messages. If you need help later, just text me."
      );

      return;
    }

    // 🎓 ADMISSION LINK
    if (intent === "ADMISSION") {

      const phone = msg.from.replace("@c.us","");

      await client.sendMessage(
        msg.from,
`🎓 *Admission Process*

Complete your enrollment here 👇
https://whatsappchatbot-81iy.onrender.com/a/${phone}

✔ Quick & simple process  
✔ Counselor support available  

Need help?
Call / WhatsApp: +91XXXXXXXXXX`
      );

      return;
    }

    // ⭐ engagement score (reply)
    tracker.trackReply(msg.from);

    if (messageStore[msg.from]) {
      messageStore[msg.from].replied = true;
    }

    try {
      const reply = await replyEngine(msg);

      if (reply) {
        await client.sendMessage(msg.from, reply);
      }

    } catch (err) {
      console.log("Reply error:", err.message);
    }

  });


  client.on("disconnected", () => {
    console.log("Reconnecting...");
    client.initialize();
  });

  process.on("unhandledRejection", err => {
    console.log("Unhandled Error:", err);
  });

  client.initialize();
}


// =============================
// START EXPRESS SERVER
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🌐 Tracking server running on port", PORT);
});

startServer();