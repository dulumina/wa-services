const jwt = require("jsonwebtoken");
const { User, Device, ApiKey } = require("../models");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" },
  );
};

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Username or email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Create default API key for new user
    const apiKey = await ApiKey.create({
      userId: user.id,
      key: `wa_${uuidv4().replace(/-/g, "")}`,
      label: "Default API Key",
      isActive: true,
    });

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
        apiKey: apiKey.key,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      status: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ username }, { email: username }],
      },
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Validate password
    const isValidPassword = await user.validPassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Get user's API keys
    const apiKeys = await ApiKey.findAll({
      where: { userId: user.id },
      attributes: ["id", "key", "label", "isActive", "createdAt"],
    });

    // Get user's devices
    const devices = await Device.findAll({
      where: { userId: user.id },
      attributes: ["id", "description", "phoneNumber", "status", "ready"],
    });

    res.json({
      status: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
        apiKeys,
        devices,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    );

    // Find user
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      status: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired refresh token",
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "role", "createdAt", "updatedAt"],
      include: [
        {
          model: ApiKey,
          as: "apiKeys",
          attributes: ["id", "key", "label", "isActive", "createdAt"],
        },
        {
          model: Device,
          as: "devices",
          attributes: ["id", "description", "phoneNumber", "status", "ready"],
        },
      ],
    });

    res.json({
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if username/email is taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          [require("sequelize").Op.or]: [
            username ? { username } : null,
            email ? { email } : null,
          ].filter(Boolean),
          id: { [require("sequelize").Op.ne]: user.id },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Username or email already in use",
        });
      }
    }

    // Update user
    await user.update({
      username: username || user.username,
      email: email || user.email,
      password: password || undefined,
    });

    res.json({
      status: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
};
