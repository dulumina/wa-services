const { Device } = require("../models");
const whatsappService = require("../services/whatsapp");

/**
 * Get all devices for current user
 */
const getDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      where: { userId: req.user.id },
      attributes: [
        "id",
        "description",
        "phoneNumber",
        "status",
        "ready",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: true,
      data: devices,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

/**
 * Get single device
 */
const getDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id, userId: req.user.id },
      attributes: [
        "id",
        "description",
        "phoneNumber",
        "status",
        "ready",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!device) {
      return res.status(404).json({
        status: false,
        message: "Device not found",
      });
    }

    res.json({
      status: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

/**
 * Create new device (starts WhatsApp session)
 */
const createDevice = async (req, res) => {
  try {
    const { id, description } = req.body;

    // Check if device already exists
    const existingDevice = await Device.findOne({
      where: { id },
    });

    if (existingDevice) {
      return res.status(400).json({
        status: false,
        message: "Device ID already exists",
      });
    }

    // Check device limit for user (optional: set max devices per user)
    const deviceCount = await Device.count({
      where: { userId: req.user.id },
    });

    const maxDevices = parseInt(process.env.MAX_DEVICES_PER_USER) || 10;
    if (deviceCount >= maxDevices) {
      return res.status(400).json({
        status: false,
        message: `Maximum device limit (${maxDevices}) reached`,
      });
    }

    // Create device record
    const device = await Device.create({
      id,
      userId: req.user.id,
      description: description || "",
      status: "authenticating",
      ready: false,
    });

    // Start WhatsApp session
    // Note: This will emit QR code via socket
    // The actual session creation is handled by the socket event

    res.status(201).json({
      status: true,
      message: "Device created. Please scan QR code to connect.",
      data: {
        id: device.id,
        description: device.description,
        status: device.status,
        ready: device.ready,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

/**
 * Update device
 */
const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const device = await Device.findOne({
      where: { id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        status: false,
        message: "Device not found",
      });
    }

    await device.update({
      description: description || device.description,
    });

    res.json({
      status: true,
      message: "Device updated successfully",
      data: {
        id: device.id,
        description: device.description,
        phoneNumber: device.phoneNumber,
        status: device.status,
        ready: device.ready,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

/**
 * Delete device (logout WhatsApp)
 */
const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        status: false,
        message: "Device not found",
      });
    }

    // Destroy WhatsApp session
    const client = whatsappService.getClient(id);
    if (client) {
      await client.destroy();
    }

    // Delete device from database
    await device.destroy();

    res.json({
      status: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

/**
 * Logout device (disconnect WhatsApp session)
 */
const logoutDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        status: false,
        message: "Device not found",
      });
    }

    // Destroy WhatsApp session
    const client = whatsappService.getClient(id);
    if (client) {
      await client.destroy();
    }

    // Update device status
    await device.update({
      status: "disconnected",
      ready: false,
      phoneNumber: null,
    });

    res.json({
      status: true,
      message: "Device logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

/**
 * Get device QR code (for re-connecting)
 */
const getDeviceQr = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        status: false,
        message: "Device not found",
      });
    }

    // Check if session exists
    const client = whatsappService.getClient(id);
    if (!client) {
      return res.status(400).json({
        status: false,
        message: "Session not found. Please create a new session.",
      });
    }

    // Request new QR code
    // This will emit via socket, so we just return a message
    res.json({
      status: true,
      message: "QR code will be sent via socket connection",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
};

module.exports = {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  logoutDevice,
  getDeviceQr,
};
