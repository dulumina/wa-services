# Feature: Device Management (Multi-Device)

## Overview
Manage multiple WhatsApp accounts (devices) from a single dashboard. Each device runs as a separate Puppeteer instance.

## Workflow
1. **Creation**: User creates a device ID in the dashboard.
2. **Initialization**: The server starts a new `whatsapp-web.js` client with a `LocalAuth` strategy.
3. **Pairing**: A QR code is generated and sent via Socket.io to the user's dashboard.
4. **Ready**: Once scanned, the session is saved locally in `.wwebjs_auth/` and the status is updated to `connected`.

## Technical Details
- **Session Persistence**: Sessions survive server restarts. The server automatically re-initializes all "connected" devices on startup.
- **Real-time Status**: Socket.io provides live updates for:
  - `qr`: New QR code received.
  - `ready`: Device successfully connected.
  - `authenticated`: Auth successful.
  - `message`: General status logs.
  - `remove-session`: Device logout/deletion.
- **Cleanup**: Logout destroys the Puppeteer instance and deletes local session files to free up resources.
