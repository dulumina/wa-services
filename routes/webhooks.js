const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const webhookController = require("../controllers/webhookController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all webhooks
router.get("/webhooks", webhookController.getWebhooks);

// Get single webhook
router.get("/webhooks/:id", webhookController.getWebhook);

// Create new webhook
router.post(
  "/webhooks",
  body("url").isURL().withMessage("Valid URL is required"),
  body("event").optional().isString(),
  webhookController.createWebhook,
);

// Update webhook
router.put(
  "/webhooks/:id",
  body("url").optional().isURL(),
  body("event").optional().isString(),
  body("isActive").optional().isBoolean(),
  webhookController.updateWebhook,
);

// Delete webhook
router.delete("/webhooks/:id", webhookController.deleteWebhook);

// Test webhook
router.post("/webhooks/:id/test", webhookController.testWebhook);

module.exports = router;
