const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");


const sessions = [];
const SESSIONS_FILE = "./whatsapp-sessions.json";

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

const createSession = function (id, description, io) {
  console.log("Creating session: " + id);
  
  // Cleanup stale Chromium lock files
  const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${id}`);
  const lockFiles = ['SingletonLock', 'SingletonCookie', 'SingletonSocket'];
  
  lockFiles.forEach(file => {
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
      dataPath: './.wwebjs_auth'
    }),
  });

  client.initialize();

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      io.emit("qr", { id: id, src: url });
      io.emit("message", { id: id, text: "QR Code received, scan please!" });
    });
  });

  client.on("ready", () => {
    io.emit("ready", { id: id });
    io.emit("message", { id: id, text: "Whatsapp is ready!" });

    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    if (sessionIndex !== -1) {
      savedSessions[sessionIndex].ready = true;
      setSessionsFile(savedSessions);
    }
  });

  client.on("authenticated", () => {
    io.emit("authenticated", { id: id });
    io.emit("message", { id: id, text: "Whatsapp is authenticated!" });
  });

  client.on("auth_failure", function () {
    io.emit("message", { id: id, text: "Auth failure, restarting..." });
  });

  client.on("disconnected", (reason) => {
    io.emit("message", { id: id, text: "Whatsapp is disconnected!" });
    client.destroy();
    client.initialize();

    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    if (sessionIndex !== -1) {
      savedSessions.splice(sessionIndex, 1);
      setSessionsFile(savedSessions);
    }

    io.emit("remove-session", id);
  });

  client.on("message", (msg) => {
    if (msg.body == "!ping") {
      msg.reply("pong");
    } else if (msg.body == "good morning") {
      msg.reply("selamat pagi");
    } else {
      console.log(msg.from + " : " + msg.body);
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

const init = function (socket, io) {
  const savedSessions = getSessionsFile();

  if (savedSessions.length > 0) {
    if (socket) {
      savedSessions.forEach((e, i, arr) => {
        arr[i].ready = false;
      });

      socket.emit("init", savedSessions);
    } else {
      savedSessions.forEach((sess) => {
        createSession(sess.id, sess.description, io);
      });
    }
  }
};

const getClient = (id) => {
  return sessions.find((sess) => sess.id == id)?.client;
}

module.exports = {
  createSession,
  init,
  getClient
};
