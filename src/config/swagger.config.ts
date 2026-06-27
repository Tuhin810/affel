import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Affiliate Marketing Platform API",
      version: "1.0.0",
      description: "API documentation for the Affiliate Marketing Platform backend services",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./src/modules/**/*.route.ts",
    "./src/modules/**/*.routes.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
