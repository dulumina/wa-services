/**
 * Rate Limiting Middleware
 * Implements per-API-key rate limiting using memory store
 * For production, use Redis-based store
 */

const rateLimit = require("express-rate-limit");

// Store for rate limiting (in-memory)
// In production, use Redis: rateLimit-redis store
const rateLimitStore = new Map();

// API Key rate limiter
const apiKeyRateLimiter = rateLimit({
  store: {
    increment: async (key) => {
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute window

      if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { totalHits: 1, resetTime: new Date(now + windowMs) };
      }

      const record = rateLimitStore.get(key);

      // Reset if window has passed
      if (now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { totalHits: 1, resetTime: new Date(now + windowMs) };
      }

      record.count++;
      rateLimitStore.set(key, record);
      return { totalHits: record.count, resetTime: new Date(record.resetTime) };
    },
    decrement: async (key) => {
      const record = rateLimitStore.get(key);
      if (record) {
        record.count--;
        rateLimitStore.set(key, record);
      }
    },
    resetKey: async (key) => {
      rateLimitStore.delete(key);
    },
  },
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    status: false,
    message: "Too many requests from this API key, please try again later.",
  },
  keyGenerator: (req) => {
    // Use API key as the key, or fall back to IP
    return req.apiKey ? req.apiKey.key : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: "Too many requests from this API key, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT User rate limiter
const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.USER_RATE_LIMIT_MAX_REQUESTS) || 200,
  message: {
    status: false,
    message: "Too many requests, please try again later.",
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: "Too many requests, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limiter (for public endpoints)
const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_REQUESTS) || 50,
  message: {
    status: false,
    message: "Too many requests, please try again later.",
  },
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: "Too many requests, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiKeyRateLimiter,
  userRateLimiter,
  globalRateLimiter,
};
