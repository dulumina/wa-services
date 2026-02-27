const User = require("./User");
const Device = require("./Device");
const ApiKey = require("./ApiKey");
const Webhook = require("./Webhook");
const MessageLog = require("./MessageLog");

// User - Device
User.hasMany(Device, { foreignKey: "userId", as: "devices" });
Device.belongsTo(User, { foreignKey: "userId", as: "user" });

// User - ApiKey
User.hasMany(ApiKey, { foreignKey: "userId", as: "apiKeys" });
ApiKey.belongsTo(User, { foreignKey: "userId", as: "user" });

// User - Webhook
User.hasMany(Webhook, { foreignKey: "userId", as: "webhooks" });
Webhook.belongsTo(User, { foreignKey: "userId", as: "user" });

// Device - MessageLog
Device.hasMany(MessageLog, {
  foreignKey: "deviceId",
  sourceKey: "id",
  as: "messageLogs",
});
MessageLog.belongsTo(Device, { foreignKey: "deviceId", as: "device" });

// ApiKey - MessageLog
ApiKey.hasMany(MessageLog, { foreignKey: "apiKeyId", as: "messageLogs" });
MessageLog.belongsTo(ApiKey, { foreignKey: "apiKeyId", as: "apiKey" });

module.exports = {
  User,
  Device,
  ApiKey,
  Webhook,
  MessageLog,
};
