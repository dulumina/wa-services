# WhatsApp API Service (Multi-Device)

A professional, multi-user, and multi-device WhatsApp API service built with Node.js, Express, and `whatsapp-web.js`. This project provides a robust backend for programmatic WhatsApp messaging and a stunning Next.js dashboard for management.

![WhatsApp API](https://img.shields.io/badge/WhatsApp-Multi--Device-green?style=for-the-badge&logo=whatsapp)
![Next.js](https://img.shields.io/badge/Dashboard-Next.js-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🚀 Key Features

- � **Multi-Device Support** - Run multiple WhatsApp sessions concurrently under a single account.
- � **Premium Dashboard** - Modern Next.js interface with real-time statistics, glassmorphism, and dark mode.
- � **Flexible Authentication** - Support for JWT (Client) and API Keys (Public Integration).
- 📨 **Message Queue** - High-performance bulk messaging system powered by **BullMQ** and **Redis**.
- 🪝 **Smart Webhooks** - Real-time push notifications for incoming messages with a built-in testing tool.
- � **Message History** - Complete logs for all sent and received messages with status tracking.
- � **Interactive API Docs** - Built-in **Swagger/OpenAPI** documentation.
- � **Postman Ready** - Ready-to-use Postman collection for quick testing.
- 🐳 **Dockerized** - Ready for containerized deployment.

## 🛠️ Tech Stack

### Backend
- **Core:** Node.js, Express.js
- **WhatsApp:** `whatsapp-web.js` (Puppeteer-based)
- **Database:** PostgreSQL with Sequelize ORM
- **Real-time:** Socket.IO
- **Queue:** BullMQ + Redis
- **Security:** JWT, BcryptJS, Rate Limiting (Express-rate-limit)

### Frontend
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Vanilla CSS (Modern Grid & Flexbox)
- **Icons:** Lucide React
- **Client:** Socket.io-client

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or v20+ recommended)
- PostgreSQL
- Redis (Required for Bulk Messaging)

### 1. Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd wa-services

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL & Redis credentials

# Sync database
npm run db:sync

# Seed initial data (Admin: admin/admin123)
npm run db:seed

# Start development server
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Dashboard available at: `http://localhost:3000`

## 📖 API Documentation

Interactive API documentation is available via Swagger at:
`http://localhost:8000/api-docs`

### Postman Collection
Find `wa-services-postman-collection.json` in the root directory. Import it to Postman for immediate testing. It includes:
- Auth (Login/Register)
- Device Management
- API Key Lifecycle
- Messaging (Single, Bulk, Media)
- Webhook Management

## 📨 Message Examples

### Send a Simple Message (API Key)
```bash
curl -X POST http://localhost:8000/api/send-message \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "your-device-id",
    "number": "628123456789",
    "message": "Hello from API!"
  }'
```

### Send Media Message (URL)
```bash
curl -X POST http://localhost:8000/api/send-media \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "your-device-id",
    "number": "628123456789",
    "fileUrl": "https://example.com/image.jpg",
    "message": "Check this out!"
  }'
```

## 📂 Project Structure

```
.
├── config/             # DB & Swagger Config
├── controllers/        # Business Logic
├── database/           # Migrations & Seeders
├── frontend/           # Next.js Dashboard
├── helpers/            # Phone & Media Utilities
├── middleware/         # Auth & Rate Limiting
├── models/             # Sequelize Models
├── routes/             # API Endpoints
├── services/           # WhatsApp & Webhook Logic
├── index.js            # Server entry point
└── nodemon.json        # Dev monitor config
```

## 🏗️ Docker Deployment
```bash
docker-compose up -d --build
```

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Acknowledgments
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [BullMQ](https://bullmq.io/)
- [Next.js](https://nextjs.org/)
