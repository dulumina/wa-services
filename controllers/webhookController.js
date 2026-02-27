const { Webhook } = require("../models");

/**
 * Get all webhooks for current user
 */
const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "url", "event", "isActive", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: true,
      data: webhooks,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to get webhooks",
      error: error.message,
    });
  }
};

/**
 * Get single webhook
 */
const getWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOne({
      where: { id, userId: req.user.id },
      attributes: ["id", "url", "event", "isActive", "createdAt", "updatedAt"],
    });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    res.json({
      status: true,
      data: webhook,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to get webhook",
      error: error.message,
    });
  }
};

/**
 * Create new webhook
 */
const createWebhook = async (req, res) => {
  try {
    const { url, event } = req.body;

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        status: false,
        message: "Invalid URL format",
      });
    }

    const webhook = await Webhook.create({
      userId: req.user.id,
      url,
      event: event || "message",
      isActive: true,
    });

    res.status(201).json({
      status: true,
      message: "Webhook created successfully",
      data: {
        id: webhook.id,
        url: webhook.url,
        event: webhook.event,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to create webhook",
      error: error.message,
    });
  }
};

/**
 * Update webhook
 */
const updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, event, isActive } = req.body;

    const webhook = await Webhook.findOne({
      where: { id, userId: req.user.id },
    });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({
          status: false,
          message: "Invalid URL format",
        });
      }
    }

    await webhook.update({
      url: url || webhook.url,
      event: event || webhook.event,
      isActive: isActive !== undefined ? isActive : webhook.isActive,
    });

    res.json({
      status: true,
      message: "Webhook updated successfully",
      data: {
        id: webhook.id,
        url: webhook.url,
        event: webhook.event,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to update webhook",
      error: error.message,
    });
  }
};

/**
 * Delete webhook
 */
const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOne({
      where: { id, userId: req.user.id },
    });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    await webhook.destroy();

    res.json({
      status: true,
      message: "Webhook deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete webhook",
      error: error.message,
    });
  }
};

/**
 * Test webhook
 */
const testWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOne({
      where: { id, userId: req.user.id },
    });

    if (!webhook) {
      return res.status(404).json({
        status: false,
        message: "Webhook not found",
      });
    }

    // Send test webhook
    const axios = require("axios");

    try {
      await axios.post(
        webhook.url,
        {
          event: "test",
          message: "This is a test webhook",
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Test": "true",
          },
        },
      );

      res.json({
        status: true,
        message: "Test webhook sent successfully",
      });
    } catch (axiosError) {
      res.status(400).json({
        status: false,
        message: "Failed to send test webhook",
        error: axiosError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to test webhook",
      error: error.message,
    });
  }
};

module.exports = {
  getWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
};
