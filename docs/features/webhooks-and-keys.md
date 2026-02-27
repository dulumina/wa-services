# Feature: Webhooks & API Keys

## Webhooks
Reverse-API calls to notify your external system of WhatsApp events.
- **Events Supported**: `message_received`, `message_sent`, `device_status`.
- **Testing**: Built-in webhook tester in the dashboard.
- **Payload**: Standard JSON payload including timestamp, event type, and data.

## API Keys
Programmatic access keys for third-party integrations.
- **Isolation**: Keys are tied to a specific user.
- **Security**: Can be revoked or regenerated at any time.
- **Usage**: Pass in headers as `x-api-key: your_key_here`.

## Documentation
The API is fully documented using Swagger (OpenAPI 3.0), accessible at `/api-docs`.
- Standardized error codes.
- Request/Response schemas.
- Tagged sections for easy navigation.
