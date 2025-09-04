require("dotenv").config({ path: __dirname + "/../../.env" });
const redis = require("redis");

// Use non-TLS for local Docker Redis
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Error:", err));
client.on("connect", () => console.log("Redis connected!"));

(async () => {
  try {
    await client.connect();
    await client.set("testKey", "Hello Local Redis");
    const value = await client.get("testKey");
    console.log("Stored value:", value);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.quit();
  }
})();
