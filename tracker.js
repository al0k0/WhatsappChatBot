const store = require("./services/messageStore");
const tracker = require("./services/engagementTracker");

function trackStatus(client) {

  client.on("message_ack", (msg, ack) => {

    if (!msg.to || msg.to.includes("@g.us")) return;

    const user = msg.to;
    const users = store.getStore();

    if (!users[user]) return;

    if (ack === 3) {

      tracker.trackRead(user);

      store.updateUser(user, {
        lastSent: Date.now()
      });

      console.log("👀 Read →", user);
    }

  });
}

module.exports = trackStatus;