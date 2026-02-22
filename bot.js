const { Client, LocalAuth } = require("whatsapp-web.js");

const isLinux = process.platform === "linux";

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".wwebjs_auth"
  }),
  puppeteer: {
    headless: true,
    executablePath: isLinux ? "/usr/bin/chromium" : undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
});

client.on("qr", qr => {
  console.log("📲 SCAN QR BELOW:\n", qr);
});

client.on("authenticated", () => {
  console.log("🔐 Authenticated");
});

client.on("ready", () => {
  console.log("✅ Bot Ready");
});

client.on("auth_failure", () => {
  console.log("❌ Auth Failed");
});

client.on("disconnected", reason => {
  console.log("⚠ Disconnected:", reason);
});

module.exports = client;