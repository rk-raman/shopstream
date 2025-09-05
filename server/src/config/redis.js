const redis = require("redis");

let redisClient = null;

const connectRedis = async () => {
  try {
    // Create Redis client
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });

    // Handle connection events
    redisClient.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });

    redisClient.on("connect", () => {
      console.log("🔗 Redis connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis Connected and ready");
    });

    redisClient.on("end", () => {
      console.log("📴 Redis disconnected");
    });

    // Connect to Redis
    await redisClient.connect();

    console.log(
      `✅ Redis Connected: ${process.env.REDIS_URL || "localhost:6379"}`
    );

    // Graceful shutdown
    process.on("SIGINT", async () => {
      if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        console.log("📴 Redis connection closed through app termination");
      }
    });

    process.on("SIGTERM", async () => {
      if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        console.log("📴 Redis connection closed through app termination");
      }
    });

    return redisClient;
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
    process.exit(1);
  }
};

// Helper function to get the Redis client instance
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };

// const { getRedisClient } = require('./config/redis');

// // In any other file
// const redisClient = getRedisClient();
// await redisClient.set('key', 'value');
//const value = await redisClient.get("key");
