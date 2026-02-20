require("dotenv").config();


const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db.js");
const Habit = require("./models/Habit.js");
const User = require("./models/User.js");
const sendReminderEmail = require("./utils/sendEmail.js");
const errorHandler = require("./middleware/errorHandler.js");

// =========================
// 1️⃣ Load Environment Variables
// =========================
dotenv.config();

// =========================
// 2️⃣ Connect Database
// =========================
connectDB();

// =========================
// 3️⃣ Initialize App
// =========================
const app = express();

// =========================
// 4️⃣ Middlewares
// =========================
app.use(cors());
app.use(express.json());

// Rate Limiting (15 min window, 100 requests max)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use(limiter);

// =========================
// 5️⃣ Routes
// =========================
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/habits", require("./routes/habitRoutes.js"));

// Health Check Route
app.get("/", (req, res) => {
  res.send("Smart Habit Tracker API Running 🚀");
});

// =========================
// 6️⃣ Daily Reminder Cron Job (7 PM)
// =========================
cron.schedule("*/1 * * * *", async () => {

  console.log("⏰ Running Daily Reminder Job...");

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
          console.log(`📧 Reminder sent to ${user.email}`);
        }
      }
    }

  } catch (error) {
    console.error("Cron Job Error:", error.message);
  }
});

// =========================
// 7️⃣ Global Error Handler
// =========================
app.use(errorHandler);

// =========================
// 8️⃣ Start Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

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

// =========================
// 1️⃣ Connect Database
// =========================
connectDB();

// =========================
// 2️⃣ Initialize App
// =========================
const app = express();

// =========================
// 3️⃣ Middlewares
// =========================

// 🔥 IMPORTANT: Replace with your real frontend URL
app.use(
  cors({
    origin: "https://smart-habit-tracker-streak-system-f.vercel.app",
    credentials: true,
  })
);

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// =========================
// 4️⃣ Routes
// =========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/habits", require("./routes/habitRoutes"));

// Health Check Route
app.get("/", (req, res) => {
  res.send("Smart Habit Tracker API Running 🚀");
});

// =========================
// 5️⃣ Daily Reminder Cron Job
// =========================
cron.schedule("0 19 * * *", async () => {
  console.log("⏰ Running Daily Reminder Job...");

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
          console.log(`📧 Reminder sent to ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error("Cron Job Error:", error.message);
  }
});

// =========================
// 6️⃣ Global Error Handler
// =========================
app.use(errorHandler);

// =========================
// 7️⃣ Start Server (Render uses process.env.PORT)
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});