const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { registerUser, loginUser } = require("../controllers/authController.js");

const validate = require("../middleware/validate");

/**
 * 🔐 Register User
 */
router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  validate,
  registerUser
);

/**
 * 🔓 Login User
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ],
  validate,
  loginUser
);

module.exports = router;
