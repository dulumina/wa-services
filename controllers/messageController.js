const { phoneNumberFormatter } = require("../helpers/formatter");
const { getClient } = require("../services/whatsapp");
const { MessageLog, Device } = require("../models");
const webhookService = require("../services/webhook");
const { MessageMedia } = require("whatsapp-web.js");

const sendMessage = async (req, res) => {
  try {
    const sender = req.body.sender;
    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;

    // Get API key or user ID for logging
    const userId = req.user
      ? req.user.id
      : req.apiKey
        ? req.apiKey.userId
        : null;
    const apiKeyId = req.apiKey ? req.apiKey.id : null;

    const client = getClient(sender);

    if (!client) {
      return res.status(422).json({
        status: false,
        message: `The sender: ${sender} is not found!`,
      });
    }

    const isRegisteredNumber = await client.isRegisteredUser(number);

    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: "The number is not registered",
      });
    }

    // Create message log
    const messageLog = await MessageLog.create({
      deviceId: sender,
      userId,
      apiKeyId,
      from: sender,
      to: number,
      message,
      type: "text",
      status: "queued",
    });

    client
      .sendMessage(number, message)
      .then(async (response) => {
        // Update message log status
        await messageLog.update({ status: "sent" });

        // Trigger webhook
        const device = await Device.findByPk(sender);
        if (device && device.userId) {
          webhookService.triggerMessageWebhook(device.userId, {
            messageId: messageLog.id,
            from: number,
            message,
            status: "sent",
            timestamp: new Date().toISOString(),
          });
        }

        res.status(200).json({
          status: true,
          response: {
            id: response.id._serialized,
            messageId: messageLog.id,
          },
        });
      })
      .catch(async (err) => {
        // Update message log status to failed
        await messageLog.update({
          status: "failed",
          errorMessage: err.message,
        });

        res.status(500).json({
          status: false,
          response: err.message,
        });
      });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const sendBulkMessage = async (req, res) => {
  try {
    const { sender, messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Messages array is required",
      });
    }

    // Get API key or user ID for logging
    const userId = req.user
      ? req.user.id
      : req.apiKey
        ? req.apiKey.userId
        : null;
    const apiKeyId = req.apiKey ? req.apiKey.id : null;

    const client = getClient(sender);

    if (!client) {
      return res.status(422).json({
        status: false,
        message: `The sender: ${sender} is not found!`,
      });
    }

    const queuedMessages = [];
    const queueService = require("../services/queue");

    for (const item of messages) {
      const number = phoneNumberFormatter(item.number);
      const message = item.message;

      // Create message log
      const messageLog = await MessageLog.create({
        deviceId: sender,
        userId,
        apiKeyId,
        from: sender,
        to: number,
        message,
        type: "text",
        status: "queued",
      });

      await queueService.enqueueMessage(messageLog.id, sender, number, message);
      
      queuedMessages.push({
        id: messageLog.id,
        number,
        status: "queued"
      });
    }

    res.status(200).json({
      status: true,
      message: "Messages added to queue system",
      data: queuedMessages
    });

  } catch (error) {
    console.error("Send bulk message error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const sendMedia = async (req, res) => {
  try {
    const sender = req.body.sender;
    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message || "";
    const fileUrl = req.body.fileUrl;
    let fileBase64 = req.body.fileBase64;
    const fileMimeType = req.body.fileMimeType;
    const fileName = req.body.fileName || "file";

    if (!fileUrl && !fileBase64) {
      return res.status(400).json({
        status: false,
        message: "Please provide either fileUrl or fileBase64",
      });
    }

    // Get API key or user ID for logging
    const userId = req.user
      ? req.user.id
      : req.apiKey
        ? req.apiKey.userId
        : null;
    const apiKeyId = req.apiKey ? req.apiKey.id : null;

    const client = getClient(sender);

    if (!client) {
      return res.status(422).json({
        status: false,
        message: `The sender: ${sender} is not found!`,
      });
    }

    const isRegisteredNumber = await client.isRegisteredUser(number);

    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: "The number is not registered",
      });
    }

    let media;

    try {
      if (fileUrl) {
        // Validate URL
        const url = new URL(fileUrl);
        if (!["http:", "https:"].includes(url.protocol)) {
            return res.status(400).json({ status: false, message: "Invalid URL protocol" });
        }
        media = await MessageMedia.fromUrl(fileUrl, { unsafeMime: true });
      } else if (fileBase64) {
        // Handle potentially missing components in base64 string
        if (!fileMimeType && !fileBase64.startsWith("data:")) {
           return res.status(400).json({
              status: false,
              message: "fileMimeType is required when providing raw fileBase64"
           });
        }
        
        let mimetype = fileMimeType;
        let b64data = fileBase64;

        // If it's a data URI, extract mimetype and base64
        if (fileBase64.startsWith("data:")) {
           const matches = fileBase64.match(/^data:(.*?);base64,(.+)$/);
           if (matches && matches.length === 3) {
             mimetype = matches[1];
             b64data = matches[2];
           } else {
             return res.status(400).json({
                status: false,
                message: "Invalid data URI format"
             });
           }
        }
        
        // Simple base64 validation
        const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        if (!base64Regex.test(b64data)) {
           return res.status(400).json({
               status: false,
               message: "Invalid base64 string"
           });
        }
        
        media = new MessageMedia(mimetype, b64data, fileName);
      }
    } catch (e) {
      console.error("Media processing error:", e);
      return res.status(400).json({
        status: false,
        message: "Failed to process media file",
        error: e.message
      });
    }

    let logType = "other";
    if (media && media.mimetype) {
      if (media.mimetype.startsWith("image/")) logType = "image";
      else if (media.mimetype.startsWith("video/")) logType = "video";
      else if (media.mimetype.startsWith("audio/")) logType = "audio";
      else if (media.mimetype.includes("pdf") || media.mimetype.includes("document")) logType = "document";
    }

    // Create message log
    const messageLog = await MessageLog.create({
      deviceId: sender,
      userId,
      apiKeyId,
      from: sender,
      to: number,
      message: message || "Media Message",
      type: logType,
      mediaUrl: fileUrl || null,
      status: "queued",
    });

    client
      .sendMessage(number, media, { caption: message })
      .then(async (response) => {
        // Update message log status
        await messageLog.update({ status: "sent" });

        // Trigger webhook
        const device = await Device.findByPk(sender);
        if (device && device.userId) {
          webhookService.triggerMessageWebhook(device.userId, {
            messageId: messageLog.id,
            from: number,
            message: message || "Media Message",
            status: "sent",
            timestamp: new Date().toISOString(),
          });
        }

        res.status(200).json({
          status: true,
          response: {
            id: response.id._serialized,
            messageId: messageLog.id,
          },
        });
      })
      .catch(async (err) => {
        // Update message log status to failed
        await messageLog.update({
          status: "failed",
          errorMessage: err.message,
        });

        res.status(500).json({
          status: false,
          response: err.message,
        });
      });
  } catch (error) {
    console.error("Send media error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  sendBulkMessage,
  sendMedia,
};
