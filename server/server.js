require("dotenv").config();
const { app, initializeServices } = require("./src/app");
const eventSystemManager = require("./src/shared/events/eventSystemManager");
const { closeQueues } = require("./src/jobs/notificationQueue");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Graceful shutdown handling
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

async function startServer() {
  try {
    // Initialize all services
    await initializeServices();

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);

  try {
    // Close notification queues
    await closeQueues();

    // Cleanup event-driven architecture
    await eventSystemManager.cleanup();

    console.log("Graceful shutdown completed");
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
  } finally {
    process.exit(0);
  }
}

// Start the server
startServer();
