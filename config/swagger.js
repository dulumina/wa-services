const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp API Services",
      version: "1.0.0",
      description: "API documentation for WhatsApp Services",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Message: {
          type: "object",
          properties: {
            sender: {
              type: "string",
              description: "Device ID of the sender",
            },
            number: {
              type: "string",
              description: "Recipient phone number",
            },
            message: {
              type: "string",
              description: "Message content",
            },
          },
          required: ["sender", "number", "message"],
        },
        BulkMessage: {
           type: "object",
           properties: {
             sender: {
                type: "string"
             },
             messages: {
                type: "array",
                items: {
                   type: "object",
                   properties: {
                      number: { type: "string" },
                      message: { type: "string" }
                   }
                }
             }
           }
        },
        MediaMessage: {
           type: "object",
           properties: {
             sender: { type: "string", description: "Device ID of the sender" },
             number: { type: "string", description: "Recipient phone number" },
             message: { type: "string", description: "Caption for the media (optional)" },
             fileUrl: { type: "string", description: "URL of the file to send (either fileUrl or fileBase64 is required)" },
             fileBase64: { type: "string", description: "Base64 encoding or Data URI of the file" },
             fileMimeType: { type: "string", description: "MIME type (required if fileBase64 is just base64 without data URI)" },
             fileName: { type: "string", description: "Name of the file (optional)" }
           },
           required: ["sender", "number"]
        }
      },
    },
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // paths to files containing swagger annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs;
