require('dotenv').config();
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const fileUpload = require('express-fileupload');

const apiRouter = require('./routes/api');
const webRouter = require('./routes/web');
const whatsappService = require('./services/whatsapp');
// const sequelize = require('./config/database'); // Can be used later for DB connection check

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ debug: false }));

// Routes
app.use('/', webRouter);
app.use('/api', apiRouter);

// Initialize Whatsapp Sessions
whatsappService.init(null, io);

// Socket IO configuration
io.on('connection', function (socket) {
  whatsappService.init(socket, io);

  socket.on('create-session', function (data) {
    whatsappService.createSession(data.id, data.description, io);
  });
});

server.listen(port, function () {
  console.log('App running on *: ' + port);
});
