# WhatsApp API Service

A multi-device Whats Node.js, Express,App API built with and whatsapp-web.js. This service allows you to manage multiple WhatsApp sessions and send messages programmatically via REST API or web interface.

![WhatsApp API](https://img.shields.io/badge/WhatsApp-API-green?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## Features

- 📱 **Multi-Device Support** - Manage multiple WhatsApp sessions simultaneously
- 🔗 **QR Code Authentication** - Real-time QR code generation for device pairing
- 🌐 **REST API** - Send messages programmatically
- 🖥️ **Web Interface** - Simple dashboard for managing devices
- 🔄 **Auto-Reconnect** - Automatic reconnection on disconnection
- 💾 **Session Persistence** - Sessions saved locally for persistence
- 🐳 **Docker Support** - Easy deployment with Docker & Docker Compose

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **WhatsApp Client:** whatsapp-web.js
- **Real-time:** Socket.IO
- **Database:** PostgreSQL (via Sequelize ORM - prepared)
- **Container:** Docker & Docker Compose

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (optional)
- WhatsApp account for pairing

## Installation

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd wa-services
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will start on `http://localhost:8000`

### Using Docker

1. Build and run with Docker Compose:

```bash
docker-compose up --build
```

2. Or pull the pre-built image:

```bash
docker pull fikridulumina/wa-services:latest
docker-compose up
```

The service will be available at `http://localhost:8000`

## Usage

### Web Interface

1. Open browser and navigate to `http://localhost:8000`
2. Enter a Device ID and Description
3. Click "Tambah Client" button
4. Scan the QR code with your WhatsApp app
5. Once connected, the device is ready to use

### Send Message via API

**Endpoint:** `POST /api/send-message`

**Request Body:**

```json
{
  "sender": "device-id",
  "number": "081234567890",
  "message": "Hello, World!"
}
```

**Example with cURL:**

```bash
curl -X POST http://localhost:8000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "my-device",
    "number": "081234567890",
    "message": "Hello from WhatsApp API!"
  }'
```

**Example with JavaScript:**

```javascript
const response = await fetch("http://localhost:8000/api/send-message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sender: "my-device",
    number: "081234567890",
    message: "Hello, World!",
  }),
});

const data = await response.json();
console.log(data);
```

**Response Success:**

```json
{
  "status": true,
  "response": {
    "id": {
      "remote": "6281234567890@c.us",
      "server": "c.us",
      "_serialized": "6281234567890@c.us"
    },
    "ack": 1,
    "body": "Hello, World!",
    "from": "6281234567890@c.us",
    "to": "6281234567890@c.us",
    "timestamp": 1234567890,
    "fromMe": true
  }
}
```

**Response Error:**

```json
{
  "status": false,
  "message": "The sender: my-device is not found!"
}
```

## API Endpoints

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | `/`                 | Web interface           |
| POST   | `/api/send-message` | Send a WhatsApp message |

## Project Structure

```
wa-services/
├── config/
│   └── database.js         # Database configuration
├── controllers/
│   └── messageController.js # Message handling logic
├── helpers/
│   └── formatter.js        # Utility functions (phone number formatting)
├── models/
│   ├── ApiKey.js           # API Key model
│   ├── Device.js           # Device model
│   ├── index.js            # Model associations
│   ├── User.js             # User model
│   └── Webhook.js          # Webhook model
├── public/
│   └── index.html          # Web interface
├── routes/
│   ├── api.js              # API routes
│   └── web.js              # Web routes
├── services/
│   └── whatsapp.js         # WhatsApp service (session management)
├── whatsapp-device/
│   └── whatsapp-sessions.json # Session storage
├── docker-compose.yml      # Docker Compose configuration
├── dockerfile              # Docker image definition
├── index.js                # Main application entry point
└── package.json            # NPM dependencies
```

## Configuration

### Environment Variables

| Variable   | Description       | Default     |
| ---------- | ----------------- | ----------- |
| PORT       | Server port       | 8000        |
| DB_HOST    | Database host     | localhost   |
| DB_USER    | Database user     | postgres    |
| DB_PASS    | Database password | postgres    |
| DB_NAME    | Database name     | wa_services |
| DB_DIALECT | Database dialect  | postgres    |

### Phone Number Format

The API accepts phone numbers in the following formats:

- `081234567890` (with leading zero)
- `6281234567890` (with country code)
- `+6281234567890` (with + prefix)

The system automatically formats numbers to WhatsApp's required format (`6281234567890@c.us`).

## Socket Events

The service emits the following Socket.IO events:

| Event            | Description                   |
| ---------------- | ----------------------------- |
| `init`           | Initialize existing sessions  |
| `create-session` | Create a new WhatsApp session |
| `qr`             | QR code generated             |
| `ready`          | WhatsApp client is ready      |
| `authenticated`  | Authentication successful     |
| `message`        | Status message                |
| `disconnected`   | Client disconnected           |
| `remove-session` | Session removed               |

## Development

### Run in Development Mode

```bash
npm run start:dev
```

This uses `nodemon` for automatic server restart on file changes.

## Troubleshooting

### Session Issues

If authentication fails or sessions are not persisting:

1. Delete the `.wwebjs_auth` folder
2. Delete the `whatsapp-device/whatsapp-sessions.json` file
3. Restart the service
4. Re-scan the QR code

### Docker Issues

If running in Docker and experiencing issues:

1. Ensure Chromium is properly installed in the container
2. Check volume mounts for session persistence
3. Verify the container has sufficient memory allocated

### Common Errors

| Error                          | Solution                                      |
| ------------------------------ | --------------------------------------------- |
| "The sender is not found"      | Make sure the device is connected and ready   |
| "The number is not registered" | The phone number is not a valid WhatsApp user |
| QR Code not showing            | Check browser console for errors              |

## License

MIT License - see LICENSE file for details.

## Author

[Nur Muhammad](https://github.com/ngekoding)

## Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - The WhatsApp client library
- [Ngekoding](https://ngekoding.github.io) - Original tutorial and inspiration
