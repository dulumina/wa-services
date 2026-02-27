const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const deviceController = require("../controllers/deviceController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all devices
router.get("/", deviceController.getDevices);

// Get single device
router.get("/:id", deviceController.getDevice);

// Create new device
router.post(
  "/",
  body("id").notEmpty().withMessage("Device ID is required"),
  body("description").optional().isString(),
  deviceController.createDevice,
);

// Update device
router.put(
  "/:id",
  body("description").optional().isString(),
  deviceController.updateDevice,
);

// Delete device
router.delete("/:id", deviceController.deleteDevice);

// Logout device
router.post("/:id/logout", deviceController.logoutDevice);

// Get device QR code
router.get("/:id/qr", deviceController.getDeviceQr);

module.exports = router;
