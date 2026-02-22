const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),

  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process"
    ]
  }
});

client.on("qr", qr => {
  console.log("📲 SCAN QR BELOW:\n");
  console.log(qr);
});

client.on("authenticated", () => {
  console.log("🔐 Authenticated");
});

client.on("ready", () => {
  console.log("✅ BOT READY");
});

client.on("auth_failure", () => {
  console.log("❌ Auth failed");
});

client.on("disconnected", reason => {
  console.log("⚠ Disconnected:", reason);
});

module.exports = client;