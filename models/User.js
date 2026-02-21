const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: String,

  delivered: Boolean,
  read: Boolean,
  replied: Boolean,

  reminderCount: { type: Number, default: 0 },
  lastInteraction: Date,

  // ⭐ engagement tracking
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  level: { type: String, default: "COLD" }
});

module.exports = mongoose.model("User", userSchema);