const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const apiKeyController = require("../controllers/apiKeyController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all API keys
router.get("/", apiKeyController.getApiKeys);

// Create new API key
router.post(
  "/",
  body("label").optional().isString(),
  apiKeyController.createApiKey,
);

// Update API key
router.put(
  "/:id",
  body("label").optional().isString(),
  body("isActive").optional().isBoolean(),
  apiKeyController.updateApiKey,
);

// Delete API key
router.delete("/:id", apiKeyController.deleteApiKey);

// Regenerate API key
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);

module.exports = router;
