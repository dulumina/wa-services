const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimiter");

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
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", authRateLimiter, registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", authRateLimiter, loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post("/refresh-token", authController.refreshToken);

// Protected routes
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/me", authenticate, authController.getProfile);
router.get("/profile", authenticate, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", authenticate, authController.updateProfile);

module.exports = router;
