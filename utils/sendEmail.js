const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendReminderEmail = async (to, habitName) => {
  try {
    await transporter.sendMail({
      from: `"Smart Habit Tracker 🔥" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔥 Don't Break Your Streak!",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>⏰ Habit Reminder</h2>
          <p>You haven't completed your habit:</p>
          <h3 style="color: orange;">${habitName}</h3>
          <p>Keep your streak alive! 🔥</p>
          <hr/>
          <small>Smart Habit Tracker</small>
        </div>
      `
    });

  } catch (error) {
    console.log("Email Error:", error);
  }
};

module.exports = sendReminderEmail;
