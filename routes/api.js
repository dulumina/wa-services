const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const { authenticate, authenticateApiKey } = require("../middleware/auth");
const {
  apiKeyRateLimiter,
  userRateLimiter,
  globalRateLimiter,
} = require("../middleware/rateLimiter");
const { ipWhitelist } = require("../middleware/ipWhitelist");

// Auth routes (public) - with global rate limit
router.use("/", globalRateLimiter, ipWhitelist);

const authRoutes = require("./auth");
router.use("/auth", authRoutes);

// Protected routes (JWT authentication) - with user rate limit
const apiKeyRoutes = require("./apiKeys");
const deviceRoutes = require("./devices");
const webhookRoutes = require("./webhooks");
const dashboardController = require("../controllers/dashboardController");

router.use("/api-keys", userRateLimiter, apiKeyRoutes);
router.use("/devices", userRateLimiter, deviceRoutes);
router.use("/webhooks", userRateLimiter, webhookRoutes);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [System]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get("/dashboard/stats", userRateLimiter, authenticate, dashboardController.getStats);

/**
 * @swagger
 * /api/send-message:
 *   post:
 *     summary: Send a WhatsApp message
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
// Public message endpoint with API key auth (with rate limit)
router.post(
  "/send-message",
  apiKeyRateLimiter,
  authenticateApiKey,
  messageController.sendMessage,
);

/**
 * @swagger
 * /api/message/send:
 *   post:
 *     summary: Send a WhatsApp message (Web App)
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
// Protected message endpoint
router.post(
  "/message/send",
  userRateLimiter,
  authenticate,
  messageController.sendMessage,
);

/**
 * @swagger
 * /api/message/logs:
 *   get:
 *     summary: Get message logs
 *     tags: [Messages]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of message logs
 */
router.get(
  "/message/logs",
  userRateLimiter,
  authenticate,
  messageController.getMessageLogs,
);

/**
 * @swagger
 * /api/send-bulk-message:
 *   post:
 *     summary: Send bulk WhatsApp messages via queue
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkMessage'
 *     responses:
 *       200:
 *         description: Messages queued successfully
 */
router.post(
  "/send-bulk-message",
  apiKeyRateLimiter,
  authenticateApiKey,
  messageController.sendBulkMessage,
);

/**
 * @swagger
 * /api/message/send-bulk:
 *   post:
 *     summary: Send bulk WhatsApp messages via queue (Web App)
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkMessage'
 *     responses:
 *       200:
 *         description: Messages queued successfully
 */
router.post(
  "/message/send-bulk",
  userRateLimiter,
  authenticate,
  messageController.sendBulkMessage,
);

/**
 * @swagger
 * /api/send-media:
 *   post:
 *     summary: Send a WhatsApp media message
 *     tags: [Messages]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaMessage'
 *     responses:
 *       200:
 *         description: Media message sent successfully
 */
// Public media message endpoint with API key auth (with rate limit)
router.post(
  "/send-media",
  apiKeyRateLimiter,
  authenticateApiKey,
  messageController.sendMedia,
);

/**
 * @swagger
 * /api/message/send-media:
 *   post:
 *     summary: Send a WhatsApp media message (Web App)
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaMessage'
 *     responses:
 *       200:
 *         description: Media message sent successfully
 */
// Protected media message endpoint
router.post(
  "/message/send-media",
  userRateLimiter,
  authenticate,
  messageController.sendMedia,
);

module.exports = router;
