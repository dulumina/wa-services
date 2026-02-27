const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const webhookController = require("../controllers/webhookController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all webhooks
/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get all webhooks
 *     tags: [Webhooks]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of webhooks
 */
router.get("/", webhookController.getWebhooks);

/**
 * @swagger
 * /api/webhooks/{id}:
 *   get:
 *     summary: Get webhook by ID
 *     tags: [Webhooks]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Webhook details
 */
router.get("/:id", webhookController.getWebhook);

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     tags: [Webhooks]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string, format: uri }
 *               event: { type: string, default: "message" }
 *     responses:
 *       201:
 *         description: Webhook created
 */
router.post(
  "/",
  body("url").isURL().withMessage("Valid URL is required"),
  body("event").optional().isString(),
  webhookController.createWebhook,
);

/**
 * @swagger
 * /api/webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     tags: [Webhooks]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Webhook deleted
 */
router.delete("/:id", webhookController.deleteWebhook);

/**
 * @swagger
 * /api/webhooks/{id}/test:
 *   post:
 *     summary: Test webhook
 *     tags: [Webhooks]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Test triggered
 */
router.post("/:id/test", webhookController.testWebhook);

module.exports = router;
