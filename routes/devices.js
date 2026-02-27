const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const deviceController = require("../controllers/deviceController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all devices
/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of devices
 */
router.get("/", deviceController.getDevices);

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     summary: Get device by ID
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Device details
 */
router.get("/:id", deviceController.getDevice);

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Create a new device session
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: "Unique session ID" }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Device created
 */
router.post(
  "/",
  body("id").notEmpty().withMessage("Device ID is required"),
  body("description").optional().isString(),
  deviceController.createDevice,
);

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     summary: Update device description
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
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
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Device updated
 */
router.put(
  "/:id",
  body("description").optional().isString(),
  deviceController.updateDevice,
);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete device session
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Device deleted
 */
router.delete("/:id", deviceController.deleteDevice);

/**
 * @swagger
 * /api/devices/{id}/logout:
 *   post:
 *     summary: Logout device session
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/:id/logout", deviceController.logoutDevice);

/**
 * @swagger
 * /api/devices/{id}/qr:
 *   get:
 *     summary: Get device QR code
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: QR code signal sent
 */
router.get("/:id/qr", deviceController.getDeviceQr);

module.exports = router;
