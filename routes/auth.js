const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Validation rules
const registerValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/auth/register", registerValidation, authController.register);
router.post("/auth/login", loginValidation, authController.login);
router.post("/auth/refresh-token", authController.refreshToken);

// Protected routes
router.get("/auth/profile", authenticate, authController.getProfile);
router.put("/auth/profile", authenticate, authController.updateProfile);

module.exports = router;
