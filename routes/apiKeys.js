const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const apiKeyController = require("../controllers/apiKeyController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all API keys
router.get("/api-keys", apiKeyController.getApiKeys);

// Create new API key
router.post(
  "/api-keys",
  body("label").optional().isString(),
  apiKeyController.createApiKey,
);

// Update API key
router.put(
  "/api-keys/:id",
  body("label").optional().isString(),
  body("isActive").optional().isBoolean(),
  apiKeyController.updateApiKey,
);

// Delete API key
router.delete("/api-keys/:id", apiKeyController.deleteApiKey);

// Regenerate API key
router.post("/api-keys/:id/regenerate", apiKeyController.regenerateApiKey);

module.exports = router;
