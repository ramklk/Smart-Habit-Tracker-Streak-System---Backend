const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String,
  completedDates: [Date],
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Habit", habitSchema);
