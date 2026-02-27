const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { Device, MessageLog, Webhook } = require("../models");

const sessions = [];
const qrs = {}; // Store the latest QR for each session
const SESSIONS_FILE = "./whatsapp-device/whatsapp-sessions.json";

const createSessionsFileIfNotExists = function () {
  if (!fs.existsSync(SESSIONS_FILE)) {
    try {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
      console.log("Sessions file created successfully.");
    } catch (err) {
      console.log("Failed to create sessions file: ", err);
    }
  }
};

createSessionsFileIfNotExists();

const setSessionsFile = function (data) {
  fs.writeFile(SESSIONS_FILE, JSON.stringify(data), function (err) {
    if (err) {
      console.log(err);
    }
  });
};

const getSessionsFile = function () {
  return JSON.parse(fs.readFileSync(SESSIONS_FILE));
};

const createSession = async function (id, description, io) {
  console.log("Creating session: " + id);

  // Check if device exists in database - required for userId
  const device = await Device.findByPk(id);
  if (!device) {
    console.log(`Device ${id} not found in database. Removing from local sessions.`);
    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    if (sessionIndex !== -1) {
      savedSessions.splice(sessionIndex, 1);
      setSessionsFile(savedSessions);
    }
    return;
  }
  const userId = device.userId;

  // Cleanup stale Chromium lock files
  const sessionPath = path.join(process.cwd(), ".wwebjs_auth", `session-${id}`);
  const lockFiles = ["SingletonLock", "SingletonCookie", "SingletonSocket"];

  lockFiles.forEach((file) => {
    const lockFilePath = path.join(sessionPath, file);
    if (fs.existsSync(lockFilePath)) {
      try {
        fs.unlinkSync(lockFilePath);
        console.log(`Cleaned up stale ${file} for session ${id}`);
      } catch (e) {
        console.log(`Failed to clean ${file}:`, e);
      }
    }
  });

  const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    },
    authStrategy: new LocalAuth({
      clientId: id,
      dataPath: "./.wwebjs_auth",
    }),
  });

  try {
    client.initialize().catch(err => {
      console.error(`Error initializing client for ${id}:`, err.message);
    });
  } catch (err) {
    console.error(`Failed to start client for ${id}:`, err);
  }

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      qrs[id] = url; // Store QR
      io.to(`user:${userId}`).emit("qr", { id: id, src: url });
      io.to(`user:${userId}`).emit("message", { id: id, text: "QR Code received, scan please!" });
    });

    // Update device status in database
    if (device) {
      device.update({ status: "authenticating", ready: false });
    }
  });

  client.on("ready", async () => {
    delete qrs[id]; // Clear QR on success
    io.to(`user:${userId}`).emit("ready", { id: id });
    io.to(`user:${userId}`).emit("message", { id: id, text: "Whatsapp is ready!" });

    // Get phone number
    const phoneNumber = client.info.me.user;

    // Update device status in database
    await device.update({
      status: "connected",
      ready: true,
      phoneNumber: phoneNumber,
    });

    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    if (sessionIndex !== -1) {
      savedSessions[sessionIndex].ready = true;
      setSessionsFile(savedSessions);
    }
  });

  client.on("authenticated", () => {
    io.to(`user:${userId}`).emit("authenticated", { id: id });
    io.to(`user:${userId}`).emit("message", { id: id, text: "Whatsapp is authenticated!" });
  });

  client.on("auth_failure", function () {
    io.to(`user:${userId}`).emit("message", { id: id, text: "Auth failure, restarting..." });

    if (device) {
      device.update({ status: "disconnected", ready: false });
    }
  });

  client.on("disconnected", async (reason) => {
    delete qrs[id]; // Clear QR on disconnect
    io.to(`user:${userId}`).emit("message", { id: id, text: "Whatsapp is disconnected!" });
    client.destroy();
    client.initialize();

    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    if (sessionIndex !== -1) {
      savedSessions.splice(sessionIndex, 1);
      setSessionsFile(savedSessions);
    }

    // Update device status in database
    if (device) {
      await device.update({
        status: "disconnected",
        ready: false,
        phoneNumber: null,
      });
    }

    io.to(`user:${userId}`).emit("remove-session", id);
  });

  client.on("message", async (msg) => {
    if (msg.body == "!ping") {
      msg.reply("pong");
    } else if (msg.body == "good morning") {
      msg.reply("selamat pagi");
    } else {
      console.log(msg.from + " : " + msg.body);

      // Log incoming message
      if (device && device.userId) {
        const from = msg.from.replace("@c.us", "");
        const to = msg.to.replace("@c.us", "");

        await MessageLog.create({
          deviceId: id,
          userId: device.userId,
          from: to,
          to: from,
          message: msg.body,
          type: "text",
          status: "delivered",
        });
      }
    }
  });

  sessions.push({
    id: id,
    description: description,
    client: client,
  });

  const savedSessions = getSessionsFile();
  const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);

  if (sessionIndex == -1) {
    savedSessions.push({
      id: id,
      description: description,
      ready: false,
    });
    setSessionsFile(savedSessions);
  }
};

const init = async function (socket, io) {
  try {
    const userId = socket?.user?.id;

    // If socket is provided, only initialize for that specific user
    if (socket && userId) {
      const dbDevices = await Device.findAll({
        where: { userId },
      });

      const sessionData = dbDevices.map((d) => ({
        id: d.id,
        description: d.description,
        ready: d.ready,
      }));
      socket.emit("init", sessionData);

      // Send pending QRs if any
      dbDevices.forEach(d => {
        if (qrs[d.id]) {
          socket.emit("qr", { id: d.id, src: qrs[d.id] });
        }
      });
      return;
    }

    // If no socket (system startup), initialize all sessions
    if (!socket) {
      const dbDevices = await Device.findAll({
        where: {
          userId: { [require("sequelize").Op.ne]: null }
        }
      });
      
      dbDevices.forEach((sess) => {
        createSession(sess.id, sess.description, io);
      });
    }
  } catch (error) {
    console.error("Error loading sessions:", error);
  }
};

const getClient = (id) => {
  return sessions.find((sess) => sess.id == id)?.client;
};

module.exports = {
  createSession,
  init,
  getClient,
};
