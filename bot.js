const { Client, LocalAuth } = require("whatsapp-web.js");
const chromium = require('chromium');
const qrcode = require('qrcode');
const express = require('express');

const app = express();
let qrImageData = '';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: chromium.path,  // ✅ chromium.path use karo
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

client.on("qr", async qr => {
  console.log("📲 QR Generated! Visit /qr to scan");
  qrImageData = await qrcode.toDataURL(qr);
});

client.on("authenticated", () => console.log("🔐 Authenticated"));
client.on("ready", () => console.log("✅ BOT READY"));
client.on("auth_failure", () => console.log("❌ Auth failed"));
client.on("disconnected", reason => console.log("⚠ Disconnected:", reason));

// QR web page
app.get('/qr', (req, res) => {
  if (qrImageData) {
    res.send(`
      <html><body style="text-align:center; margin-top:50px">
        <h2>WhatsApp QR Code</h2>
        <img src="${qrImageData}" />
        <p>Scan karo WhatsApp se</p>
      </body></html>
    `);
  } else {
    res.send('<h3>QR ready nahi hai, 10 sec baad refresh karo ♻️</h3>');
  }
});

app.listen(process.env.PORT || 3000);

module.exports = client;