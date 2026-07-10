# Concurrency Control Documentation

## The Problem

In e-commerce, multiple users can attempt to buy the same product simultaneously. Without proper concurrency control, this leads to **overselling** — more orders placed than stock available.

```
Product: 2 units in stock

User A: reads stock (2) → passes validation → creates order → reserves stock → stock = 0
User B: reads stock (2) → passes validation → creates order → reserves stock → stock = -2

Result: 4 units sold, only 2 exist. Both customers get confirmation emails.
```

This is a classic **TOCTOU** (Time Of Check, Time Of Use) race condition. The stock is checked in one step and decremented in a later step with no guarantee that another request doesn't modify it in between.

---

## Where Race Conditions Can Occur

### 1. Add to Cart

```
User A: product.stock = 2, wants 2 → passes check ✓
User B: product.stock = 2, wants 2 → passes check ✓ (same moment)

Both users now have 2 items in cart, but only 2 exist total.
```

**Risk level:** Low — cart doesn't reserve stock. Real validation happens at checkout.

### 2. Checkout (Order Placement)

```
User A: confirmAndPlaceOrder()
  1. Read stock: 2 available           ← CHECK
  2. Validate: 2 >= 2 → pass
  3. Create order document
  4. Save order to DB
  5. Reserve stock: 2 - 2 = 0          ← USE (much later)

User B: confirmAndPlaceOrder() (concurrent)
  1. Read stock: 2 available            ← Sees 2 because step 5 hasn't run yet
  2. Validate: 2 >= 2 → pass
  3. Create order document
  4. Save order to DB
  5. Reserve stock: 0 - 2 = -2          ← OVERSOLD
```

**Risk level:** Critical — this is where money changes hands.

### 3. Inventory Reservation

```
Request 1: inventory.reserveStock(2)
  - Read availableStock = 5
  - Check: 5 >= 2 ✓
  - Set availableStock = 5 - 2 = 3
  - Save                                ← WRITE happens here

Request 2: inventory.reserveStock(4) (concurrent)
  - Read availableStock = 5             ← Reads BEFORE Request 1 saves
  - Check: 5 >= 4 ✓
  - Set availableStock = 5 - 4 = 1
  - Save                                ← Overwrites Request 1's save

Final: availableStock = 1 (should be -1, means oversold by 1)
```

**Risk level:** Critical — the non-atomic read-modify-write pattern.

---

## Our Solution: 3 Defense Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CHECKOUT REQUEST                       │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │ Layer 1: REDIS DISTRIBUTED LOCK                  │     │
│  │ Prevents: double-submit, duplicate orders        │     │
│  │ Mechanism: SET NX EX (atomic acquire)            │     │
│  │ Scope: per checkout session                      │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │ Layer 2: ATOMIC MONGODB OPERATIONS       │     │     │
│  │  │ Prevents: overselling, negative stock    │     │     │
│  │  │ Mechanism: findOneAndUpdate + $inc + $gte│     │     │
│  │  │ Scope: per product/variant               │     │     │
│  │  │                                           │     │     │
│  │  │  ┌─────────────────────────────────┐     │     │     │
│  │  │  │ Layer 3: ROLLBACK ON FAILURE     │     │     │     │
│  │  │  │ Prevents: ghost reservations     │     │     │     │
│  │  │  │ Mechanism: try/catch + release   │     │     │     │
│  │  │  │ Scope: entire order transaction  │     │     │     │
│  │  │  └─────────────────────────────────┘     │     │     │
│  │  └─────────────────────────────────────────┘     │     │
│  └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: Redis Distributed Lock

### What It Does

Prevents the same checkout session from being processed twice simultaneously. This handles the "user double-clicks Place Order" scenario.

### How It Works

```
User clicks "Place Order":
  1. Try to SET lock:checkout:{sessionId} with NX (only if not exists) and EX (auto-expire 15s)
  2. If SET returns OK → lock acquired, proceed with order
  3. If SET returns null → another request already holds the lock → reject with "Please try again"
  4. After order completes (or fails) → release lock via Lua script (safe delete)
```

### Implementation

```javascript
// server/src/shared/utils/redisLock.js

class RedisLock {
  async acquire(key, ttlMs = 10000, retries = 3) {
    const lockKey = `lock:${key}`;
    const lockValue = `${this.lockId}:${Date.now()}`;  // unique per process

    const result = await this.client.set(lockKey, lockValue, {
      NX: true,   // Only set if key does NOT exist (atomic!)
      PX: ttlMs,  // Auto-expire to prevent deadlocks
    });

    return result === "OK";
  }

  async release(key) {
    // Lua script: only delete if we own the lock (prevents releasing someone else's lock)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(script, { keys: [lockKey], arguments: [lockValue] });
  }

  async withLock(key, ttlMs, fn) {
    const acquired = await this.acquire(key, ttlMs);
    if (!acquired) throw new Error("Could not acquire lock. Please try again.");
    try {
      return await fn();
    } finally {
      await this.release(key);  // Always release, even on error
    }
  }
}
```

### Why Lua Script for Release?

Without it:

```
Process A: GET lock → value is "A" → matches → DEL lock
Process B: (between GET and DEL) → lock expired → Process B SET lock → "B"
Process A: DEL lock ← DELETES PROCESS B's LOCK!
```

The Lua script makes GET + compare + DEL atomic on the Redis server.

### Why Auto-Expire (TTL)?

If the server crashes while holding a lock, the lock would be held forever (deadlock). The 15-second TTL ensures the lock auto-releases even if the holder dies.

---

## Layer 2: Atomic MongoDB Operations

### What It Does

Prevents two concurrent requests from both decrementing stock past zero. This is the core overselling protection.

### The Problem with Read-Modify-Write

```javascript
// VULNERABLE (old code):
const inventory = await Inventory.findOne({ product: productId });
if (inventory.availableStock < quantity) throw "Out of stock";  // READ + CHECK
inventory.availableStock -= quantity;                             // MODIFY
await inventory.save();                                           // WRITE

// Between READ and WRITE, another request can modify the same document!
```

### The Fix: Atomic findOneAndUpdate

```javascript
// SAFE (new code):
const inventory = await Inventory.findOneAndUpdate(
  {
    product: productId,
    availableStock: { $gte: quantity }  // CHECK is part of the query
  },
  {
    $inc: {
      availableStock: -quantity,         // DECREMENT is atomic with CHECK
      reservedStock: quantity
    }
  },
  { new: true }
);

if (!inventory) {
  // Either doesn't exist or insufficient stock — no oversell possible
  throw new ApiError(409, "Insufficient stock");
}
```

### Why This Is Safe

MongoDB guarantees that `findOneAndUpdate` is atomic at the document level. The `$gte` condition and `$inc` operation happen in a single atomic step — no other operation can interleave.

```
Stock: 2 units

Request A: findOneAndUpdate({ availableStock: { $gte: 2 } }, { $inc: { availableStock: -2 } })
  → MongoDB checks: 2 >= 2 ✓ → sets availableStock = 0 → returns doc
  → ATOMIC — no gap between check and decrement

Request B: findOneAndUpdate({ availableStock: { $gte: 2 } }, { $inc: { availableStock: -2 } })
  → MongoDB checks: 0 >= 2 ✗ → returns null (no matching document)
  → Request B gets "Insufficient stock" error — CORRECT!
```

### Methods Using Atomic Operations

| Method | Operation | Condition |
|--------|-----------|-----------|
| `reserveStock()` | `$inc: { availableStock: -qty, reservedStock: +qty }` | `availableStock >= qty` |
| `releaseStock()` | `$inc: { availableStock: +qty, reservedStock: -qty }` | `reservedStock >= qty` |
| `atomicDecrementProductStock()` | `$inc: { stock: -qty }` | `stock >= qty` |
| `atomicIncrementProductStock()` | `$inc: { stock: +qty }` | None (always succeeds) |

---

## Layer 3: Rollback on Failure

### What It Does

If stock is reserved but the order save fails (DB error, validation error, etc.), the reserved stock is released back. Prevents "ghost reservations" where stock is held but no order exists.

### The Flow

```
confirmAndPlaceOrder():
  reservedItems = []

  try {
    // Step 1: Reserve stock for EACH item (atomic per item)
    for each item:
      inventoryService.reserveStock(item)    // atomic $inc
      reservedItems.push(item)               // track what we reserved

    // Step 2: Create order (only after ALL stock is reserved)
    order = new Order(...)
    await order.save()

    // Step 3: Post-order cleanup
    clearCart(), markCouponUsed(), updateSession()

    return order

  } catch (error) {
    // ROLLBACK: Release ALL reserved items
    for each item in reservedItems:
      inventoryService.releaseStock(item)    // atomic $inc (reverse)

    throw error  // Re-throw so user sees the error
  }
```

### Why Reserve BEFORE Order Creation?

Old flow (vulnerable):

```
1. Create order → saved to DB
2. Reserve stock → FAILS (out of stock)
→ Order exists in DB but stock not reserved → customer sees "confirmed" but can't fulfill
```

New flow (safe):

```
1. Reserve stock → FAILS (out of stock)
→ No order created, no side effects → customer sees "out of stock" error → clean
```

---

## Complete Checkout Timeline (Safe)

```
User A and User B both click "Place Order" at the same moment.
Product has 2 units. User A wants 2, User B wants 1.

User A:
  1. Acquire Redis lock "checkout:session_A" → OK
  2. reserveStock(product, qty=2)
     → findOneAndUpdate({ availableStock: { $gte: 2 } }, { $inc: { availableStock: -2 } })
     → MongoDB: 2 >= 2 ✓ → availableStock = 0 → returns doc
  3. Create order → save to DB
  4. Clear cart, mark coupon used
  5. Release Redis lock
  → SUCCESS: Order confirmed

User B: (happens concurrently)
  1. Acquire Redis lock "checkout:session_B" → OK (different session)
  2. reserveStock(product, qty=1)
     → findOneAndUpdate({ availableStock: { $gte: 1 } }, { $inc: { availableStock: -1 } })
     → MongoDB: 0 >= 1 ✗ → returns null
     → throws ApiError(409, "Insufficient stock. Only 0 available.")
  3. Rollback: nothing to rollback (no items reserved yet)
  4. Release Redis lock
  → FAILURE: "Insufficient stock" → User B sees error message

Final state:
  - availableStock = 0 (correct)
  - 1 order exists (User A's)
  - User B got a clear error message
  - No overselling
```

---

## Cart vs Checkout: Different Strategies

| Concern | Cart (addToCart) | Checkout (confirmAndPlaceOrder) |
|---------|-----------------|-------------------------------|
| Stock check | Soft (read-only) | Hard (atomic reserve) |
| Blocks other users? | No | Only during the ~200ms lock |
| Can oversell? | No (cart doesn't decrement) | No (atomic $inc) |
| User experience | "Only 2 available" warning | "Insufficient stock" error |
| Purpose | Prevent obviously bad adds | Prevent actual overselling |

Cart uses **optimistic** approach: let users add freely, validate later.
Checkout uses **pessimistic** approach: lock and reserve atomically.

---

## Edge Cases Handled

### Double-Click "Place Order"

```
Click 1: acquires Redis lock "checkout:session_123" → processes order
Click 2: tries to acquire same lock → FAILS → "Please try again" error
```

### Server Crash During Checkout

```
1. Redis lock acquired (TTL: 15s)
2. Stock reserved for 2 items
3. Server crashes before order.save()

After 15 seconds:
- Redis lock auto-expires (no deadlock)
- Reserved stock remains in inventory (reservedStock field)
- A background cleanup job can release orphaned reservations
```

### Multiple Items, Partial Stock

```
Order has 3 items: Item A (2 units), Item B (1 unit), Item C (3 units)

1. Reserve Item A → success (reservedItems = [A])
2. Reserve Item B → success (reservedItems = [A, B])
3. Reserve Item C → FAILS (insufficient stock)

Rollback:
  - Release Item A stock
  - Release Item B stock
  → All stock restored, no partial reservation
```

### Concurrent Orders for Different Products

```
User A: buys Product X → lock "checkout:session_A", reserve Product X stock
User B: buys Product Y → lock "checkout:session_B", reserve Product Y stock

No conflict — different sessions, different products. Both succeed in parallel.
```

### Same Product, Different Variants

```
Product has: Red (5 stock), Blue (3 stock)

User A: buys Red × 5 → reserves Red stock → success
User B: buys Blue × 3 → reserves Blue stock → success (different SKU)
User C: buys Red × 1 → reserves Red stock → FAILS (0 available)

No cross-variant conflict. Each variant has its own inventory record.
```

---

## Monitoring

### Redis Lock Metrics

Check for lock contention:

```bash
# Count active locks
redis-cli KEYS "lock:checkout:*" | wc -l

# Check a specific lock
redis-cli GET "lock:checkout:session_123"
redis-cli TTL "lock:checkout:session_123"
```

### Inventory Integrity Check

Verify no negative stock:

```javascript
// Find any documents with negative availableStock (should be zero)
db.inventories.find({ availableStock: { $lt: 0 } })

// Find orphaned reservations (reservedStock > 0 but no matching pending order)
db.inventories.find({ reservedStock: { $gt: 0 } })
```

---

## File Reference

| File | Purpose |
|------|---------|
| `server/src/shared/utils/redisLock.js` | Redis distributed lock utility (Layer 1) |
| `server/src/modules/inventory/services/inventory.service.js` | Atomic `reserveStock()`, `releaseStock()`, `atomicDecrementProductStock()` (Layer 2) |
| `server/src/modules/checkout/services/checkout.service.js` | `confirmAndPlaceOrder()` with lock + reserve-first + rollback (Layer 3) |
| `server/src/modules/cart/services/cart.service.js` | Soft stock checks with available count in error messages |
| `server/src/config/redis.js` | Redis client used by RedisLock |
| `server/src/modules/inventory/models/Inventory.model.js` | Inventory schema (availableStock, reservedStock fields) |
