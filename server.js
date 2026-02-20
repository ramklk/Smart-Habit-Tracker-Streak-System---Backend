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

connectDB();

const app = express();

// 🔥 CORS CONFIGURED FOR YOUR FRONTEND
// app.use(
//   cors({
//     origin: "https://smart-habit-tracker-streak-system-f.vercel.app",
//     credentials: true,
//   })
// );


app.use(cors('*'));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/habits", require("./routes/habitRoutes"));

// Health Check
app.get("/", (req, res) => {
  res.send("Smart Habit Tracker API Running 🚀");
});

// Cron Job (7 PM daily)
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

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});