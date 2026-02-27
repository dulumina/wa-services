# Feature: Messaging & Queue System

## Overview
Handle high-volume messaging without performance degradation using a distributed queue system.

## Message Types
- **Text Messages**: Simple string messages.
- **Media Messages**: Images, Documents, or Files via URL or Base64.
- **Bulk Messages**: Sending the same or different messages to multiple contacts simultaneously.

## Queue Implementation (BullMQ)
When a bulk request is received:
1. Messages are parsed and added to a Redis-backed queue (`messageQueue`).
2. The API returns an immediate "Queued" response.
3. Workers process the queue in the background.
4. Includes automatic retry logic for failed messages.

## Security
- **SSRF Protection**: For media messages via URL, the system validates that the URL is not pointing to an internal IP (e.g., 127.0.0.1, 10.x.x.x, 169.254.x.x).
- **Owner Validation**: The system ensures the `sender` device ID belongs to the user making the request.
