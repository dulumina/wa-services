require("dotenv").config();
const express = require("express");
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
    whatsappService.init(null, io);

    // Start server
    server.listen(port, function () {
      console.log("App running on *: " + port);
    });
  } catch (error) {
    console.error("Failed to start app:", error);
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
