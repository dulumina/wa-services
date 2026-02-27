# Implementation TODO - wa-services Roadmap

## Phase 1: Foundation & Database Migration

### 1. Database Initialization

- [x] Create database sync script
- [x] Add database sync in index.js on startup
- [x] Create migrations if needed

### 2. JWT Authentication

- [x] Create auth controller (register, login)
- [x] Create auth routes (/api/auth/register, /api/auth/login)
- [x] Create JWT middleware for protected routes
- [x] Create user profile endpoints

### 3. API Key Management

- [x] Create API key controller
- [x] Create API key routes
- [x] Implement API key validation middleware

### 4. Device Management

- [x] Create device controller
- [x] Create device routes
- [x] Link device creation to WhatsApp session
- [x] Store device info in database
- [ ] Migrate session storage from JSON to Database (PostgreSQL)

### 5. Webhook Management

- [x] Create webhook controller
- [x] Create webhook routes
- [x] Add webhook triggering on message events

### 6. Message Logging

- [x] Create MessageLog model
- [x] Add message logging in whatsapp service
- [x] Add message status logging

## Phase 2: Robust Messaging & Webhooks

### 7. Queue System (Redis + BullMQ)

- [x] Install Redis dependency
- [x] Create queue service
- [x] Implement message queue for bulk sending
- [x] Add queue monitoring

### 8. Better Webhook System

- [x] Add retry logic for failed webhooks
- [x] Add webhook event types
- [x] Add webhook signature/verification

### 9. Media Handler

- [x] Implement file/image sending via URL
- [x] Implement file/image sending via Base64 string
- [x] Securely handle and validate media inputs

## Phase 3: Dashboard & API Client Portal

### 10. Web Interface / Dashboard

- [x] Build Admin & User Dashboard (Next.js / React)
- [x] Implement responsive UI for managing devices & API keys
- [x] Add connection status monitoring in real-time

### 11. API Statistics

- [ ] Track daily API usage (messages sent, rate limits hit)
- [ ] Display usage statistics on the Dashboard

### 12. API Documentation

- [x] Add Swagger/OpenAPI documentation
- [x] Create API docs endpoint

## Phase 4: Optimization & Security

### 13. Rate Limiting

- [x] Implement per-API-key rate limiting
- [x] Add rate limit headers

### 14. Additional Security

- [x] IP Whitelisting (optional)
- [x] Implement SSRF protection for media delivery (restrict internal IP range access)
- [x] Secure Bull Board dashboard (/admin/queues) with authentication middleware
- [x] Sanitize API responses to prevent leakage of technical error details (hide `error.message`)
- [x] Remove hardcoded JWT secret fallbacks and enforce environment variable presence
- [x] Implement specific rate limiting for Auth endpoints (Login & Register) to prevent brute-force
- [x] Tighten CORS configuration by restricting `origin` to allowed domains only

### 15. Dockerization & CI/CD

- [x] Create Dockerfile for wa-services
- [x] Setup docker-compose.yml with PostgreSQL & Redis
- [x] Improve container permissions and security
<!-- - [ ] Implement CI/CD pipeline for automated deployment -->

## Phase 5: Advanced Messaging & AI

### 16. Smart Messaging
- [ ] Implement Auto-Reply / Keyword-based chatbot
- [ ] Add AI Integration (OpenAI/ChatGPT) for intelligent responses
- [ ] Implement Message Templates with dynamic variables (`{{name}}`, etc.)
- [ ] Add Scheduled Messages functionality

## Phase 6: Contact Management & Reporting

### 17. Data & Analytics
- [ ] Add Contact & Group Sync via API
- [ ] Implement Export to CSV/Excel for message logs
- [ ] Create detailed usage analytics dashboard (success rate, trends)
- [ ] Add Webhook Debugging Activity Log / UI

## Phase 7: Enterprise Features & Scaling

### 18. Multi-Tenancy & Operations
- [ ] Implement Multi-user / Team access management
- [ ] Add Cloud Storage integration (S3) for persistent media
- [ ] Add Session disconnection notifications (Email/Webhook)
- [ ] Implement Two-Factor Authentication (2FA) for Dashboard
