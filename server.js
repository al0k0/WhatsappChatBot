// load environment variables
require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const client = require("./bot");

const tracker = require("./services/engagementTracker");
const { sendBulk } = require("./campaign");
const messageStore = require("./services/messageStore");
const replyEngine = require("./replyEngine");
const detectIntent = require("./services/detectIntent");

const trackStatus = require("./tracker");
const startReminder = require("./scheduler");


const clickMap = require("./services/clickMap");

// 🌐 WEBSITE VISIT
app.get("/w/:id", (req, res) => {

  const id = req.params.id;
  const phone = clickMap[id];

  if (!phone) return res.send("Invalid link");

  console.log("🌐 Website click:", phone);

  tracker.trackClick(phone);

  res.redirect("https://charter-temp.vercel.app");
});


// 🎓 APPLY LINK
app.get("/a/:id", (req, res) => {

  const id = req.params.id;
  const phone = clickMap[id];

  if (!phone) return res.send("Invalid link");

  console.log("🎓 Apply click:", phone);

  tracker.trackClick(phone);

  res.redirect("https://charter-temp.vercel.app/apply");
});

// =============================
// OPTIONAL DATABASE CONNECTION
// =============================

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch {
    console.log("⚠ Running without database...");
  }
}


async function startServer() {

  // await connectDB(); // optional

  // WhatsApp ready
  client.on("ready", async () => {

    console.log("✅ Bot Ready");

    trackStatus(client);   // delivered & read tracking
    startReminder();       // follow-up reminders

    console.log("🚀 Starting campaign...");
    sendBulk();            // send bulk intro messages

    // auto check leads 
    setInterval(() => {
    console.log("🔍 Checking new leads...");
    sendBulk();
  }, 60000);   // every 3 minutes
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

    // keyword fallback
    if (/admission|enroll|apply|join|fees|registration/i.test(text)) {
      intent = "ADMISSION";
    }

    // ❌ NEGATIVE INTENT (stop reminders)
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

    // 🎯 ADMISSION INTENT
    if (intent === "ADMISSION") {
      const id = Math.random().toString(36).substring(2, 7);
clickMap[id] = msg.from;
      await client.sendMessage(
        
        msg.from,
`🎓 *Admission Process*

Complete your enrollment here 👇
https://charter-temp.vercel.app/apply

✔ Quick & simple process  
✔ Counselor support available  

Need more help?:
Call / WhatsApp: +91XXXXXXXXXX`
      );
      return;
    }

    // ⭐ engagement scoring (+25)
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


  // reconnect if disconnected
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
// 🌐 START EXPRESS SERVER
// =============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🌐 Tracking server running on port", PORT);
});

startServer();