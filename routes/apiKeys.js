const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const apiKeyController = require("../controllers/apiKeyController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all API keys
/**
 * @swagger
 * /api/api-keys:
 *   get:
 *     summary: Get all API keys
 *     tags: [API Keys]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.get("/", apiKeyController.getApiKeys);

/**
 * @swagger
 * /api/api-keys:
 *   post:
 *     summary: Create a new API key
 *     tags: [API Keys]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label: { type: string }
 *     responses:
 *       201:
 *         description: API key created
 */
router.post(
  "/",
  body("label").optional().isString(),
  apiKeyController.createApiKey,
);

/**
 * @swagger
 * /api/api-keys/{id}:
 *   put:
 *     summary: Update API key
 *     tags: [API Keys]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: API key updated
 */
router.put(
  "/:id",
  body("label").optional().isString(),
  body("isActive").optional().isBoolean(),
  apiKeyController.updateApiKey,
);

/**
 * @swagger
 * /api/api-keys/{id}:
 *   delete:
 *     summary: Delete API key
 *     tags: [API Keys]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: API key deleted
 */
router.delete("/:id", apiKeyController.deleteApiKey);

/**
 * @swagger
 * /api/api-keys/{id}/regenerate:
 *   post:
 *     summary: Regenerate API key
 *     tags: [API Keys]
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Key regenerated
 */
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);

module.exports = router;
