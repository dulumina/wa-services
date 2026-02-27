require("dotenv").config();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const path = require("path");
const fileUpload = require("express-fileupload");

const apiRouter = require("./routes/api");
const whatsappService = require("./services/whatsapp");
const { authenticate } = require("./middleware/auth");
const sequelize = require("./config/database");

// Queue setup
const { messageQueue } = require("./services/queue");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(messageQueue)],
  serverAdapter: serverAdapter,
});

// Swagger Setup
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ debug: false }));

// Routes
app.use("/api", apiRouter);

/**
 * @swagger
 * /admin/queues:
 *   get:
 *     summary: Queue monitoring dashboard (Bull Board)
 *     tags: [System]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Bull Board UI
 */
// Secure Bull Board with authentication
app.use("/admin/queues", authenticate, serverAdapter.getRouter());

// Initialize Database and Whatsapp Sessions
const startApp = async () => {
  try {
    // Sync database (create tables if not exist)
    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized!");

    // Initialize Whatsapp Sessions
    try {
      whatsappService.init(null, io);
    } catch (err) {
      console.error("Error during initial sessions load:", err);
    }

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check
     *     tags: [System]
     *     responses:
     *       200:
     *         description: System is healthy
     */
    app.get("/health", (req, res) => {
      res.json({ status: "ok", time: new Date() });
    });

    // Frontend Static Serving & Catch-all
    app.use(express.static(path.join(__dirname, "frontend/out"), {
      extensions: ['html']
    }));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "frontend/out/index.html"));
    });

    // Start server
    server.listen(port, function () {
      const addr = server.address();
      const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
      console.log("✅ Server is listening on " + bind);
      console.log("✅ Local access: http://localhost:" + port);
    });
  } catch (error) {
    console.error("❌ Failed to start app:", error);
    process.exit(1);
  }
};

// Socket IO configuration
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  const jwt = require("jsonwebtoken");
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    return next(new Error("Authentication error: JWT_SECRET not configured"));
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid token"));
    socket.user = { id: decoded.userId };
    next();
  });
});

io.on("connection", function (socket) {
  const userId = socket.user.id;
  console.log(`Socket connected: ${socket.id} (User: ${userId})`);
  
  // Join a room for this user
  socket.join(`user:${userId}`);

  whatsappService.init(socket, io);

  socket.on("create-session", async function (data) {
    try {
      const { Device } = require("./models");
      const device = await Device.findOne({
        where: { id: data.id, userId: userId }
      });

      if (!device) {
        console.warn(`User ${userId} attempted to create session for unauthorized device ${data.id}`);
        socket.emit("message", { id: data.id, text: "Unauthorized: You do not own this device." });
        return;
      }

      whatsappService.createSession(data.id, data.description, io);
    } catch (err) {
      console.error("Error in create-session socket handler:", err);
    }
  });
});

// Start the application
startApp();
