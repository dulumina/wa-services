const jwt = require("jsonwebtoken");
const { User, ApiKey } = require("../models");

/**
 * JWT Authentication Middleware
 * Validates JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // Find user
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token expired.",
      });
    }

    return res.status(401).json({
      status: false,
      message: "Invalid token.",
    });
  }
};

/**
 * API Key Authentication Middleware
 * Validates API key from X-API-Key header
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No API key provided.",
      });
    }

    // Find API key in database
    const apiKeyRecord = await ApiKey.findOne({
      where: { key: apiKey, isActive: true },
      include: [{ model: User, as: "user" }],
    });

    if (!apiKeyRecord) {
      return res.status(401).json({
        status: false,
        message: "Invalid or inactive API key.",
      });
    }

    req.apiKey = apiKeyRecord;
    req.user = apiKeyRecord.user;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "API key validation failed.",
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers["x-api-key"];

    // Check for API key first
    if (apiKey) {
      const apiKeyRecord = await ApiKey.findOne({
        where: { key: apiKey, isActive: true },
        include: [{ model: User, as: "user" }],
      });

      if (apiKeyRecord) {
        req.apiKey = apiKeyRecord;
        req.user = apiKeyRecord.user;
      }
    }
    // Then check for JWT
    else if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      );
      const user = await User.findByPk(decoded.userId);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authenticateApiKey,
  optionalAuth,
};
