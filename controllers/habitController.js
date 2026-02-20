const Habit = require("../models/Habit.js");

/**
 * 📝 Create Habit
 */
exports.createHabit = async (req, res) => {
  try {
    const { title } = req.body;

    const habit = await Habit.create({
      userId: req.user.id,
      title,
      completedDates: []
    });

    res.status(201).json(habit);

  } catch (error) {
    res.status(500).json({ message: "Error creating habit", error });
  }
};


/**
 * 📋 Get All Habits of Logged-in User
 */
exports.getUserHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });

    res.status(200).json(habits);

  } catch (error) {
    res.status(500).json({ message: "Error fetching habits", error });
  }
};


/**
 * 🔥 Mark Habit as Done (Check-in)
 */
exports.markHabitDone = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // ✅ Ownership Check
    if (habit.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const today = new Date().toDateString();
    const lastDate = habit.completedDates.slice(-1)[0];

    if (lastDate && new Date(lastDate).toDateString() === today) {
      return res.status(400).json({ message: "Already marked today" });
    }

    if (lastDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (new Date(lastDate).toDateString() === yesterday.toDateString()) {
        habit.currentStreak += 1;
      } else {
        habit.currentStreak = 1;
      }
    } else {
      habit.currentStreak = 1;
    }

    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak;
    }

    habit.completedDates.push(new Date());
    await habit.save();

    res.json(habit);

  } catch (error) {
    res.status(500).json({ message: "Error updating streak", error });
  }
};



/**
 * ❌ Delete Habit
 */
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // ✅ Ownership Check
    if (habit.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await habit.deleteOne();

    res.json({ message: "Habit deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting habit", error });
  }
};



exports.getStats = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });

    const today = new Date();
    const weekAgo = new Date();
    const monthAgo = new Date();

    weekAgo.setDate(today.getDate() - 7);
    monthAgo.setDate(today.getDate() - 30);

    let totalHabits = habits.length;
    let totalCompletions = 0;
    let weeklyCompletions = 0;
    let monthlyCompletions = 0;

    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        totalCompletions++;

        if (new Date(date) >= weekAgo) {
          weeklyCompletions++;
        }

        if (new Date(date) >= monthAgo) {
          monthlyCompletions++;
        }
      });
    });

    const successRate = totalHabits === 0
      ? 0
      : ((weeklyCompletions / (7 * totalHabits)) * 100).toFixed(2);

    res.json({
      totalHabits,
      totalCompletions,
      weeklyCompletions,
      monthlyCompletions,
      successRate: Number(successRate),
      habits: habits.map(habit => ({
        title: habit.title,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak
      }))
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};
