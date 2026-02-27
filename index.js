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
const fileUpload = require("express-fileupload");

const apiRouter = require("./routes/api");
const webRouter = require("./routes/web");
const whatsappService = require("./services/whatsapp");
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

app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ debug: false }));

// Routes
app.use("/", webRouter);
app.use("/api", apiRouter);
app.use("/admin/queues", serverAdapter.getRouter());

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

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok", time: new Date() });
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
io.on("connection", function (socket) {
  whatsappService.init(socket, io);

  socket.on("create-session", function (data) {
    whatsappService.createSession(data.id, data.description, io);
  });
});

// Start the application
startApp();
