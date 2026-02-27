const { ApiKey } = require("../models");
const { v4: uuidv4 } = require("uuid");

/**
 * Get all API keys for current user
 */
const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "key", "label", "isActive", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: true,
      data: apiKeys,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to get API keys",
      error: error.message,
    });
  }
};

/**
 * Create new API key
 */
const createApiKey = async (req, res) => {
  try {
    const { label } = req.body;

    const apiKey = await ApiKey.create({
      userId: req.user.id,
      key: `wa_${uuidv4().replace(/-/g, "")}`,
      label: label || "API Key",
      isActive: true,
    });

    res.status(201).json({
      status: true,
      message: "API key created successfully",
      data: {
        id: apiKey.id,
        key: apiKey.key,
        label: apiKey.label,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to create API key",
      error: error.message,
    });
  }
};

/**
 * Update API key (label, active status)
 */
const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, isActive } = req.body;

    const apiKey = await ApiKey.findOne({
      where: { id, userId: req.user.id },
    });

    if (!apiKey) {
      return res.status(404).json({
        status: false,
        message: "API key not found",
      });
    }

    await apiKey.update({
      label: label || apiKey.label,
      isActive: isActive !== undefined ? isActive : apiKey.isActive,
    });

    res.json({
      status: true,
      message: "API key updated successfully",
      data: {
        id: apiKey.id,
        key: apiKey.key,
        label: apiKey.label,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to update API key",
      error: error.message,
    });
  }
};

/**
 * Delete API key
 */
const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({
      where: { id, userId: req.user.id },
    });

    if (!apiKey) {
      return res.status(404).json({
        status: false,
        message: "API key not found",
      });
    }

    // Prevent deleting the last API key
    const keyCount = await ApiKey.count({
      where: { userId: req.user.id },
    });

    if (keyCount <= 1) {
      return res.status(400).json({
        status: false,
        message: "Cannot delete the last API key",
      });
    }

    await apiKey.destroy();

    res.json({
      status: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete API key",
      error: error.message,
    });
  }
};

/**
 * Regenerate API key
 */
const regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({
      where: { id, userId: req.user.id },
    });

    if (!apiKey) {
      return res.status(404).json({
        status: false,
        message: "API key not found",
      });
    }

    // Generate new key
    const newKey = `wa_${uuidv4().replace(/-/g, "")}`;

    await apiKey.update({ key: newKey });

    res.json({
      status: true,
      message: "API key regenerated successfully",
      data: {
        id: apiKey.id,
        key: newKey,
        label: apiKey.label,
        isActive: apiKey.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to regenerate API key",
      error: error.message,
    });
  }
};

module.exports = {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiKey,
};
