const axios = require("axios");
const { Webhook } = require("../models");

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Send webhook with retry logic
 */
const sendWebhook = async (url, payload, secret, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-Webhook-Event": payload.event || "message",
      };

      if (secret) {
        const crypto = require("crypto");
        const signature = crypto
          .createHmac("sha256", secret)
          .update(JSON.stringify(payload))
          .digest("hex");
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
      }

      await axios.post(url, payload, {
        timeout: 10000,
        headers,
      });
      return { success: true };
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed:`, error.message);

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * attempt),
        );
      }
    }
  }
  return { success: false, error: "Max retries reached" };
};

/**
 * Trigger webhooks for a specific event
 */
const triggerWebhooks = async (userId, event, data) => {
  try {
    // Get all active webhooks for the user
    const webhooks = await Webhook.findAll({
      where: {
        userId,
        isActive: true,
        event: event, // Can be 'message', 'status', etc.
      },
    });

    const results = [];

    for (const webhook of webhooks) {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      const result = await sendWebhook(webhook.url, payload, webhook.secret);
      results.push({
        webhookId: webhook.id,
        url: webhook.url,
        ...result,
      });
    }

    return results;
  } catch (error) {
    console.error("Error triggering webhooks:", error);
    return [];
  }
};

/**
 * Trigger message event webhooks
 */
const triggerMessageWebhook = async (userId, messageData) => {
  return triggerWebhooks(userId, "message", messageData);
};

/**
 * Trigger status event webhooks
 */
const triggerStatusWebhook = async (userId, statusData) => {
  return triggerWebhooks(userId, "status", statusData);
};

/**
 * Trigger connection event webhooks
 */
const triggerConnectionWebhook = async (userId, connectionData) => {
  return triggerWebhooks(userId, "connection", connectionData);
};

module.exports = {
  sendWebhook,
  triggerWebhooks,
  triggerMessageWebhook,
  triggerStatusWebhook,
  triggerConnectionWebhook,
};
