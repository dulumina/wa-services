# System Architecture

## Overview
WA-Services is a multi-tenant WhatsApp API gateway built specifically for multi-user environments. It provides a robust, secure, and scalable way to interact with WhatsApp using the `whatsapp-web.js` library.

## Core Technologies
- **Backend**: Node.js with Express.js
- **Frontend**: Next.js 15+ (App Router)
- **Database**: PostgreSQL (via Sequelize ORM)
- **Queue System**: Redis & BullMQ
- **Real-time**: Socket.io
- **Documentation**: Swagger/OpenAPI 3.0

## High-Level Diagram
1. **Client/UI**: Next.js dashboard for managing devices and keys.
2. **API Layer**: Express.js handling REST requests and authentication.
3. **Queue Layer**: BullMQ handles bulk messaging to prevent blocking.
4. **Worker Layer**: Processes messages from the queue and interacts with WhatsApp.
5. **WhatsApp Layer**: Individual `whatsapp-web.js` instances running in Puppeteer.

## Security Architecture
- **JWT Auth**: Every request to the API/Dashboard requires a Bearer token.
- **API Key Auth**: Public endpoints use unique API keys per user.
- **Multi-Tenancy**: All data (Devices, Messages, Webhooks) is isolated at the database and memory level using `userId`.
- **SSRF Protection**: Built-in validation for media URLs to prevent internal infrastructure scanning.
- **Rate Limiting**: Per-user and per-API key limits to prevent abuse.
