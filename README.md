# WhatsApp API Service

A multi-user, multi-device WhatsApp API built with Node.js, Express, and whatsapp-web.js. This service allows you to manage multiple WhatsApp sessions per user and send messages programmatically via REST API with API key authentication.

![WhatsApp API](https://img.shields.io/badge/WhatsApp-API-green?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## Features

- 👥 **Multi-User Support** - SaaS-ready with user registration and JWT authentication
- 📱 **Multi-Device** - Manage multiple WhatsApp sessions per user
- 🔑 **API Key Management** - Create and manage multiple API keys per user
- 🔗 **QR Code Authentication** - Real-time QR code generation for device pairing
- 🌐 **REST API** - Send messages programmatically with API key or JWT
- 🪝 **Webhook Support** - Receive real-time notifications with retry logic
- 📊 **Message Logging** - Track all sent and received messages
- 🖥️ **Web Interface** - Simple dashboard for managing devices
- 🔄 **Auto-Reconnect** - Automatic reconnection on disconnection
- 💾 **Session Persistence** - Sessions saved to database for persistence
- 🐳 **Docker Support** - Easy deployment with Docker & Docker Compose
- ⚡ **Rate Limiting** - Built-in rate limiting per API key and user

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **WhatsApp Client:** whatsapp-web.js
- **Real-time:** Socket.IO
- **Database:** PostgreSQL (via Sequelize ORM)
- **Authentication:** JWT + API Keys
- **Container:** Docker & Docker Compose

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Docker and Docker Compose (optional)
- WhatsApp account for pairing

## Installation

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd wa-services
```

2. Copy environment configuration:

```bash
cp .env.example .env
```

3. Configure your `.env` file:

```env
PORT=8000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=wa_services
DB_DIALECT=postgres
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

4. Install dependencies:

```bash
npm install
```

5. Start the server:

```bash
npm start
```

The server will start on `http://localhost:8000`

### Using Docker

1. Build and run with Docker Compose:

```bash
docker-compose up --build
```

The service will be available at `http://localhost:8000`

## Usage

### Authentication

The API supports two authentication methods:

1. **JWT Token** - For dashboard and user management
2. **API Key** - For programmatic access

#### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

Response:

```json
{
  "status": true,
  "message": "Login success",
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com"
    },
    "token": "eyJhbG...",
    "refreshToken": "eyJ..."
  }
}
```

### API Key Management

#### Create API Key

```bash
curl -X POST http://localhost:8000/api/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "label": "My API Key"
  }'
```

### Device Management

#### Create Device (WhatsApp Session)

```bash
curl -X POST http://localhost:8000/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "device-001",
    "description": "My WhatsApp Device"
  }'
```

#### Get All Devices

```bash
curl -X GET http://localhost:8000/api/devices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Webhook Management

#### Create Webhook

```bash
curl -X POST http://localhost:8000/api/webhooks \
  -H "Content-Type": application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "url": "https://your-server.com/webhook",
    "event": "message"
  }'
```

### Send Message via API

#### Using API Key:

```bash
curl -X POST http://localhost:8000/api/send-message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "sender": "device-001",
    "number": "081234567890",
    "message": "Hello, World!"
  }'
```

#### Using JWT:

```bash
curl -X POST http://localhost:8000/api/message/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sender": "device-001",
    "number": "081234567890",
    "message": "Hello, World!"
  }'
```

**Response Success:**

```json
{
  "status": true,
  "response": {
    "id": "message-id",
    "messageId": "uuid"
  }
}
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | User login          |
| POST   | `/api/auth/refresh`  | Refresh token       |
| GET    | `/api/auth/profile`  | Get user profile    |
| PUT    | `/api/auth/profile`  | Update user profile |

### API Keys

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/api/api-keys`     | List all API keys   |
| POST   | `/api/api-keys`     | Create API key      |
| GET    | `/api/api-keys/:id` | Get API key details |
| DELETE | `/api/api-keys/:id` | Delete API key      |

### Devices

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/devices`            | List all devices   |
| POST   | `/api/devices`            | Create new device  |
| GET    | `/api/devices/:id`        | Get device details |
| PUT    | `/api/devices/:id`        | Update device      |
| DELETE | `/api/devices/:id`        | Delete device      |
| POST   | `/api/devices/:id/logout` | Logout device      |

### Webhooks

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| GET    | `/api/webhooks`          | List all webhooks   |
| POST   | `/api/webhooks`          | Create webhook      |
| GET    | `/api/webhooks/:id`      | Get webhook details |
| PUT    | `/api/webhooks/:id`      | Update webhook      |
| DELETE | `/api/webhooks/:id`      | Delete webhook      |
| POST   | `/api/webhooks/:id/test` | Test webhook        |

### Messages

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| POST   | `/api/send-message` | Send message (API Key) |
| POST   | `/api/message/send` | Send message (JWT)     |

## Project Structure

```
wa-services/
├── config/
│   └── database.js           # Database configuration
├── controllers/
│   ├── apiKeyController.js  # API Key management
│   ├── authController.js    # Authentication
│   ├── deviceController.js  # Device management
│   ├── messageController.js # Message handling
│   └── webhookController.js # Webhook management
├── helpers/
│   └── formatter.js          # Utility functions
├── middleware/
│   ├── auth.js              # JWT & API Key auth
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── ApiKey.js            # API Key model
│   ├── Device.js            # Device model
│   ├── index.js             # Model associations
│   ├── MessageLog.js       # Message log model
│   ├── User.js             # User model
│   └── Webhook.js          # Webhook model
├── public/
│   └── index.html           # Web interface
├── routes/
│   ├── api.js               # Main API routes
│   ├── apiKeys.js           # API Key routes
│   ├── auth.js              # Auth routes
│   ├── devices.js           # Device routes
│   ├── web.js               # Web routes
│   └── webhooks.js          # Webhook routes
├── services/
│   ├── webhook.js           # Webhook service
│   └── whatsapp.js          # WhatsApp service
├── scripts/
│   └── dbSync.js            # Database sync script
├── docker-compose.yml       # Docker Compose config
├── dockerfile               # Docker image
├── index.js                 # Main entry point
├── package.json             # NPM dependencies
└── .env.example             # Environment template
```

## Configuration

### Environment Variables

| Variable                     | Description          | Default     |
| ---------------------------- | -------------------- | ----------- |
| PORT                         | Server port          | 8000        |
| DB_HOST                      | Database host        | localhost   |
| DB_USER                      | Database user        | postgres    |
| DB_PASS                      | Database password    | postgres    |
| DB_NAME                      | Database name        | wa_services |
| DB_DIALECT                   | Database dialect     | postgres    |
| JWT_SECRET                   | JWT secret key       | -           |
| JWT_EXPIRES_IN               | JWT token expiration | 7d          |
| MAX_DEVICES_PER_USER         | Max devices per user | 10          |
| RATE_LIMIT_MAX_REQUESTS      | API key requests/min | 100         |
| USER_RATE_LIMIT_MAX_REQUESTS | User requests/min    | 200         |

## Webhook Events

When a webhook is triggered, it sends a POST request to your URL with the following payload:

```json
{
  "event": "message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "messageId": "uuid",
    "from": "6281234567890",
    "message": "Hello",
    "status": "sent"
  }
}
```

### Supported Events

- `message` - New message sent/received
- `status` - Message status update
- `connection` - Device connection status

### Webhook Retry

Failed webhooks are automatically retried up to 3 times with exponential backoff.

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

## Troubleshooting

### Session Issues

If authentication fails or sessions are not persisting:

1. Delete the `.wwebjs_auth` folder
2. Delete the `whatsapp-device/whatsapp-sessions.json` file
3. Restart the service
4. Re-scan the QR code

### Database Issues

If you encounter database errors:

1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Create the database manually if needed: `CREATE DATABASE wa_services;`

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
| "Unauthorized"                 | Check your JWT token or API key               |
| "Too many requests"            | You've exceeded the rate limit                |

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - The WhatsApp client library
- [Ngekoding](https://ngekoding.github.io) - Original tutorial and inspiration
