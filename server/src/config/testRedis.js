// testRedis.js
require("dotenv").config({ path: __dirname + "/../../.env" });
const redis = require("redis");

// Verify that .env is loaded
console.log("REDIS_URL =", process.env.REDIS_URL);

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true, // Required for rediss://
    rejectUnauthorized: false, // Accept Upstash TLS certificate
  },
});

client.on("error", (err) => console.error("Redis Error:", err));
client.on("connect", () => console.log("Redis connected!"));

(async () => {
  try {
    await client.connect();

    // Set a test key
    await client.set("testKey", "Hello Upstash TLS");

    // Get the test key
    const value = await client.get("testKey");
    console.log("Stored value:", value);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.quit();
  }
})();
