/**
 * Redis Distributed Lock
 *
 * Provides mutual exclusion for critical sections across multiple
 * server instances. Uses SET NX EX for atomic lock acquisition.
 *
 * Usage:
 *   const lock = new RedisLock(redisClient);
 *   const acquired = await lock.acquire("product:123", 10000);
 *   try {
 *     // critical section
 *   } finally {
 *     await lock.release("product:123");
 *   }
 *
 * Or use the helper:
 *   await lock.withLock("product:123", 10000, async () => {
 *     // critical section
 *   });
 */

const crypto = require("crypto");

class RedisLock {
  constructor(redisClient) {
    this.client = redisClient;
    // Unique ID per process to prevent releasing someone else's lock
    this.lockId = crypto.randomBytes(8).toString("hex");
    this.locks = new Map(); // key → lockValue
  }

  /**
   * Acquire a lock.
   * @param {string} key - Lock key (e.g. "stock:product:123")
   * @param {number} ttlMs - Lock auto-expire in milliseconds (default 10s)
   * @param {number} retries - Number of retries (default 3)
   * @param {number} retryDelayMs - Delay between retries (default 200ms)
   * @returns {boolean} - True if acquired
   */
  async acquire(key, ttlMs = 10000, retries = 3, retryDelayMs = 200) {
    const lockKey = `lock:${key}`;
    const lockValue = `${this.lockId}:${Date.now()}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.client.set(lockKey, lockValue, {
          NX: true, // Only set if key does NOT exist
          PX: ttlMs, // Auto-expire in ms
        });

        if (result === "OK") {
          this.locks.set(key, lockValue);
          return true;
        }
      } catch (err) {
        console.error(`[RedisLock] Error acquiring lock ${key}:`, err.message);
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }

    return false;
  }

  /**
   * Release a lock. Only releases if we own it (prevents accidental release).
   * @param {string} key - Lock key
   * @returns {boolean} - True if released
   */
  async release(key) {
    const lockKey = `lock:${key}`;
    const lockValue = this.locks.get(key);

    if (!lockValue) return false;

    try {
      // Atomic check-and-delete via Lua script
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.client.eval(script, {
        keys: [lockKey],
        arguments: [lockValue],
      });

      this.locks.delete(key);
      return result === 1;
    } catch (err) {
      console.error(`[RedisLock] Error releasing lock ${key}:`, err.message);
      this.locks.delete(key);
      return false;
    }
  }

  /**
   * Execute a function while holding a lock.
   * Acquires lock, runs fn, releases lock (even on error).
   *
   * @param {string} key - Lock key
   * @param {number} ttlMs - Lock TTL
   * @param {Function} fn - Async function to execute
   * @returns {*} - Return value of fn
   * @throws {Error} - If lock cannot be acquired, or fn throws
   */
  async withLock(key, ttlMs, fn) {
    const acquired = await this.acquire(key, ttlMs);
    if (!acquired) {
      throw new Error(
        `Could not acquire lock for ${key}. Another request is processing this item. Please try again.`
      );
    }

    try {
      return await fn();
    } finally {
      await this.release(key);
    }
  }
}

module.exports = RedisLock;
