# Feature: Authentication & Multi-Tenancy

## Overview
Secure access control is the backbone of WA-Services. It ensures that multiple users can share the same infrastructure without data leakage.

## Features
### 1. User Registration & Login
- Secure password hashing using Bcrypt.
- Response includes JWT Token and Refresh Token.
- Default API Key generation upon registration.

### 2. Multi-Tenancy (Isolation)
- **Database Level**: Every table includes a `userId` foreign key.
- **Socket Level**: Users join a private room `user:{userId}`. Events are never broadcasted globally.
- **Memory Level**: WhatsApp sessions are stored with their IDs, and access is validated against the database owner.

### 3. JWT Middleware
- Validates tokens on all `/api/` routes except public auth.
- Injects `req.user` for downstream controller logic.

### 4. Route Protection
- Frontend: `MainWrapper` component prevents unauthorized access to dashboard pages.
- Backend: Bull Board and API endpoints are protected by `authenticate` middleware.
