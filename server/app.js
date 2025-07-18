  const express = require("express");
  const cors = require("cors");
  const { 
    createUserTable, 
    createApiUsageTable,
    createStoriesTable,
    createTagsTable,
    createStoryTagsTable
  } = require("./db/connection");
  const apiRoutes = require("./routes");
  const cookieParser = require("cookie-parser");
  const app = express();
  const swaggerJsdoc = require("swagger-jsdoc");
  const swaggerUi = require("swagger-ui-express");
  require("dotenv").config();
  const { ROUTES, BASE } = require("./routes/route");

  app.use(cookieParser());
  app.use(express.json());
  const allowedOrigins = [
    "https://storygenerator30.netlify.app",
    "http://localhost:3000"
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"]
  }));

  // Ensure tables exist
  createUserTable();
  createApiUsageTable();
  createStoriesTable();
  createTagsTable();
  createStoryTagsTable();


  // Swagger
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "My API",
        version: "1.0.0",
        description: "API documentation with Swagger",
      },
    },
    apis: ["./routes/*.js"], // Path to API route files
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use(`${BASE}/doc`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Routes
  app.use(BASE, apiRoutes);

  // Start the server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
