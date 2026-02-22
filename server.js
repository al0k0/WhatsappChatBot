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
// QR CODE ROUTE  ← YE ADD KARO
// =============================
let latestQR = '';

app.get("/qr", (req, res) => {
  if (latestQR) {
    res.send(`
      <html><body style="text-align:center; margin-top:50px; font-family:sans-serif">
        <h2>📱 WhatsApp QR Code</h2>
        <img src="${latestQR}" style="width:300px"/>
        <p>Scan karo WhatsApp se → Linked Devices → Link a Device</p>
        <p><small>QR 20 sec mein expire hota hai, page refresh karo naya QR lene ke liye</small></p>
      </body></html>
    `);
  } else {
    res.send(`
      <html>
        <head><meta http-equiv="refresh" content="5"/></head>
        <body style="text-align:center; margin-top:50px; font-family:sans-serif">
          <h3>⏳ QR generate ho raha hai... 5 sec mein auto refresh hoga</h3>
        </body>
      </html>
    `);
  }
});

// =============================
// WEBSITE CLICK TRACKING
// =============================
app.get("/w/:phone", (req, res) => {
  const phone = req.params.phone + "@c.us";
  tracker.trackClick(phone);
  console.log("CLICK:", phone);
  res.redirect("https://charter-temp.vercel.app");
});

app.get("/a/:phone", (req, res) => {
  const phone = req.params.phone + "@c.us";
  tracker.trackClick(phone);
  res.redirect("https://charter-temp.vercel.app/apply");
});

app.get("/", (req, res) => {
  res.send("✅ Bot tracking server running");
});


async function startServer() {

  // ← QR EVENT YAHAN PAKDO
  client.on("qr", async qr => {
    const qrcode = require('qrcode');
    latestQR = await qrcode.toDataURL(qr);
    console.log("📲 QR Generated! Visit /qr to scan");
  });

  client.on("ready", async () => {
    latestQR = ''; // QR clear karo jab connected ho jaye
    trackStatus(client);
    startReminder();
    console.log("🚀 Starting campaign...");
    sendBulk();

    setInterval(() => {
      console.log("🔍 Checking new leads...");
      sendBulk();
    }, 180000);
  });

  client.on("message", async msg => {
    if (msg.fromMe) return;
    if (!msg.from.endsWith("@c.us")) return;

    const text = msg.body.toLowerCase();
    let intentRaw = await detectIntent(text);
    let intent = String(intentRaw || "OTHER").toUpperCase();

    if (/admission|apply|join|fees|enroll/i.test(text)) {
      intent = "ADMISSION";
    }

    if (intent === "NEGATIVE") {
      if (messageStore[msg.from]) {
        messageStore[msg.from].optOut = true;
      }
      await client.sendMessage(msg.from, "👍 Understood. I won't send more messages. If you need help later, just text me.");
      return;
    }

    if (intent === "ADMISSION") {
      const phone = msg.from.replace("@c.us", "");
      await client.sendMessage(msg.from,
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

    tracker.trackReply(msg.from);

    try {
      const reply = await replyEngine(msg);
      if (reply) await client.sendMessage(msg.from, reply);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 Tracking server running on port", PORT);
});

startServer();