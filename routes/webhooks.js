const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const webhookController = require("../controllers/webhookController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all webhooks
router.get("/", webhookController.getWebhooks);

// Get single webhook
router.get("/:id", webhookController.getWebhook);

// Create new webhook
router.post(
  "/",
  body("url").isURL().withMessage("Valid URL is required"),
  body("event").optional().isString(),
  webhookController.createWebhook,
);

// Update webhook
router.put(
  "/:id",
  body("url").optional().isURL(),
  body("event").optional().isString(),
  body("isActive").optional().isBoolean(),
  webhookController.updateWebhook,
);

// Delete webhook
router.delete("/:id", webhookController.deleteWebhook);

// Test webhook
router.post("/:id/test", webhookController.testWebhook);

module.exports = router;
