const express = require("express");
const router = express.Router();

const {
  createHabit,
  getUserHabits,
  markHabitDone,
  deleteHabit
} = require("../controllers/habitController.js");

const { getStats } = require("../controllers/habitController.js");

const authMiddleware = require("../middleware/authMiddleware.js");


/**
 * 📝 Create New Habit
 * POST /api/habits
 */
router.post("/", authMiddleware, createHabit);

/**
 * 📋 Get All Habits of Logged-in User
 * GET /api/habits
 */
router.get("/", authMiddleware, getUserHabits);

router.get("/stats", authMiddleware, getStats);

/**
 * 🔥 Mark Habit as Done (Check-in)
 * POST /api/habits/:id/checkin
 */
router.post("/:id/checkin", authMiddleware, markHabitDone);

/**
 * ❌ Delete Habit
 * DELETE /api/habits/:id
 */
router.delete("/:id", authMiddleware, deleteHabit);

module.exports = router;
