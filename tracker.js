const messageStore = require("./services/messageStore");
const engagementTracker = require("./services/engagementTracker");

function trackStatus(client) {

  client.on("message_ack", (msg, ack) => {

    if (!msg.to || msg.to.includes("@g.us")) return;

    const user = msg.to;

    if (!messageStore[user]) return;

    // 📦 Delivered
    if (ack === 2) {
      messageStore[user].delivered = true;
      engagementTracker.trackDelivered(user);
      console.log("📦 Delivered →", user);
    }

    // 👀 Read
    if (ack === 3) {
      messageStore[user].read = true;

      // ⭐ reset timer when user reads
      messageStore[user].lastSent = Date.now();

      engagementTracker.trackRead(user);

      console.log("👀 Read →", user);
    }

  });
}

module.exports = trackStatus;