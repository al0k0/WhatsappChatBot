const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on("qr", qr => {
  console.log("Scan QR:");
  qrcode.generate(qr, { small: true });
});


module.exports = client;
