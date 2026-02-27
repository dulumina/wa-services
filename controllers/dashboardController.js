const { Device, ApiKey, MessageLog } = require("../models");
const { Op } = require("sequelize");

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count devices
    const deviceCount = await Device.count({ where: { userId } });

    // Count active API keys
    const apiKeyCount = await ApiKey.count({ where: { userId, isActive: true } });

    // Count messages sent today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const messagesSentToday = await MessageLog.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: startOfDay,
        },
      },
    });

    // Count failed items (today)
    const failedMessages = await MessageLog.count({
      where: {
        userId,
        status: "failed",
        createdAt: {
          [Op.gte]: startOfDay,
        },
      },
    });

    // Recent activity (last 10 messages/logs)
    const recentActivity = await MessageLog.findAll({
      where: { userId },
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Device,
          as: "device",
          attributes: ["id"],
        },
      ],
    });

    res.json({
      status: true,
      data: {
        stats: {
          activeDevices: deviceCount,
          apiKeys: apiKeyCount,
          messagesSentToday,
          failedItems: failedMessages,
        },
        recentActivity: recentActivity.map((log) => ({
          id: log.id,
          event: "Message sent",
          device: log.device ? log.device.id : "Unknown",
          status: log.status,
          time: log.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = {
  getStats,
};
