// const { app, initializeServices } = require("./src/app");

// const PORT = process.env.PORT || 5000;

// // Graceful shutdown handling
// process.on("SIGINT", gracefulShutdown);
// process.on("SIGTERM", gracefulShutdown);

// async function startServer() {
//   try {
//     // Initialize all services
//     await initializeServices();

//     // Start the server
//     const server = app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
//       console.log(`🌐 API URL: http://localhost:${PORT}/api`);
//     });

//     // Handle server errors
//     server.on("error", (error) => {
//       console.error("Server error:", error);
//       process.exit(1);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// }

// function gracefulShutdown(signal) {
//   console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);

//   // Close database connections, stop background jobs, etc.
//   process.exit(0);
// }

// // Start the server
// startServer();

// Load environment variables first
require("dotenv").config();

const app = require("./src/app");
const { connectDB } = require("./src/config");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Start server function
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log("\n🚀 ===== SERVER STARTED =====");
      console.log(`📱 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log("================================\n");
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);

      server.close((err) => {
        if (err) {
          console.error("❌ Error during server shutdown:", err);
          process.exit(1);
        }

        console.log("✅ Server closed successfully");
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
