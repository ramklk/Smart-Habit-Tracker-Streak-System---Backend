require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const Habit = require("./models/Habit");
const User = require("./models/User");
const sendReminderEmail = require("./utils/sendEmail");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ===============================
   DATABASE CONNECTION
================================ */
connectDB();

/* ===============================
   CORS CONFIGURATION
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://smart-habit-tracker-streak-system-f.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());

// Rate Limiter (after CORS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/habits", require("./routes/habitRoutes"));

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("Smart Habit Tracker API Running 🚀");
});

/* ===============================
   CRON JOB (7 PM DAILY)
================================ */
cron.schedule("0 19 * * *", async () => {
  try {
    const habits = await Habit.find();
    const today = new Date().toDateString();

    for (let habit of habits) {
      const completedToday = habit.completedDates.some(
        (date) => new Date(date).toDateString() === today
      );

      if (!completedToday) {
        const user = await User.findById(habit.userId);
        if (user) {
          await sendReminderEmail(user.email, habit.title);
        }
      }
    }
  } catch (error) {
    console.error("Cron Job Error:", error.message);
  }
});

/* ===============================
   ERROR HANDLER
================================ */
app.use(errorHandler);

/* ===============================
   SERVER START
================================ */
module.exports = app;