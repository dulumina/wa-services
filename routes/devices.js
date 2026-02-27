const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const deviceController = require("../controllers/deviceController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all devices
router.get("/devices", deviceController.getDevices);

// Get single device
router.get("/devices/:id", deviceController.getDevice);

// Create new device
router.post(
  "/devices",
  body("id").notEmpty().withMessage("Device ID is required"),
  body("description").optional().isString(),
  deviceController.createDevice,
);

// Update device
router.put(
  "/devices/:id",
  body("description").optional().isString(),
  deviceController.updateDevice,
);

// Delete device
router.delete("/devices/:id", deviceController.deleteDevice);

// Logout device
router.post("/devices/:id/logout", deviceController.logoutDevice);

// Get device QR code
router.get("/devices/:id/qr", deviceController.getDeviceQr);

module.exports = router;
