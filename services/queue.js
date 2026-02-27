const { Queue, Worker } = require("bullmq");
const path = require("path");
const { getClient } = require("./whatsapp");
const { MessageLog, Device } = require("../models");
const webhookService = require("./webhook");

// Redis connection configuration
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Create the message queue
const messageQueue = new Queue("messageQueue", { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Create the worker
const messageWorker = new Worker(
  "messageQueue",
  async (job) => {
    const { messageLogId, sender, number, message } = job.data;

    try {
      const client = getClient(sender);
      if (!client) {
        throw new Error(`Device ${sender} is not connected or initialized.`);
      }

      const isRegisteredNumber = await client.isRegisteredUser(number);
      if (!isRegisteredNumber) {
        throw new Error(`Number ${number} is not registered on WhatsApp.`);
      }

      // Send the message
      const response = await client.sendMessage(number, message);
      return {
        id: response.id._serialized,
        originalNumber: number,
      };
    } catch (error) {
      console.error(`Job failed [${job.id}]:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "5", 10),
  }
);

messageWorker.on("completed", async (job, returnvalue) => {
  try {
    const { messageLogId, sender, number, message } = job.data;

    // Update message log status
    await MessageLog.update(
      { status: "sent" },
      { where: { id: messageLogId } }
    );

    // Trigger webhook
    const device = await Device.findByPk(sender);
    if (device && device.userId) {
      webhookService.triggerMessageWebhook(device.userId, {
        messageId: messageLogId,
        from: number,
        message,
        status: "sent",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`Post-processing completion error for job [${job.id}]:`, error);
  }
});

messageWorker.on("failed", async (job, err) => {
  try {
    const { messageLogId, sender, number, message } = job.data;

    // Update message log status to failed
    await MessageLog.update(
      { status: "failed", errorMessage: err.message },
      { where: { id: messageLogId } }
    );
    
    // Trigger failed webhook event could happen here if defined in requirements
  } catch (error) {
    console.error(`Post-processing failure error for job [${job.id}]:`, error);
  }
});

/**
 * Adds a message sending job to the queue
 */
const enqueueMessage = async (messageLogId, sender, number, message) => {
  return await messageQueue.add("sendMessage", {
    messageLogId,
    sender,
    number,
    message,
  });
};

module.exports = {
  messageQueue,
  messageWorker,
  enqueueMessage,
};
