const redis = require("redis");

(async () => {
  const client = redis.createClient({ url: "redis://localhost:6379" });

  client.on("error", (err) => console.error("Redis Error:", err));
  client.on("connect", () => console.log("Redis connected!"));

  await client.connect();

  await client.set("testKey", "Hello Redis");
  const value = await client.get("testKey");

  console.log("Stored value:", value);

  await client.quit();
})();
