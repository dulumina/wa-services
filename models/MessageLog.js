const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MessageLog = sequelize.define(
  "MessageLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    apiKeyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM(
        "text",
        "image",
        "video",
        "audio",
        "document",
        "other",
      ),
      defaultValue: "text",
    },
    status: {
      type: DataTypes.ENUM("queued", "sent", "delivered", "read", "failed"),
      defaultValue: "queued",
    },
    mediaUrl: {
      type: DataTypes.STRING,
    },
    errorMessage: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "message_logs",
    timestamps: true,
  },
);

module.exports = MessageLog;
