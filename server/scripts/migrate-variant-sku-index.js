#!/usr/bin/env node
/*
Migration helper: drop old variants.sku index (if present), report documents
with null/empty variant SKUs, optionally fix them, then create a partial
unique index on variants.sku so null/empty values are not indexed.

Usage:
  MONGO_URI="mongodb://..." node migrate-variant-sku-index.js
  MONGO_URI="mongodb://..." node migrate-variant-sku-index.js --fix

Be sure to BACKUP before running.
*/

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/shopstream";

async function main() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const db = client.db();
    const coll = db.collection("products");

    console.log("Connected to:", uri);

    const indexes = await coll.indexes();
    console.log("Existing indexes:");
    indexes.forEach((ix) =>
      console.log(`  - ${ix.name}: ${JSON.stringify(ix.key)}`)
    );

    // Find any existing index on variants.sku
    const existing = indexes.find(
      (ix) => ix.key && ix.key["variants.sku"] === 1
    );
    if (existing) {
      console.log(`Found existing index on variants.sku -> ${existing.name}`);
      if (existing.unique) {
        console.log(
          "Index is unique — this can cause duplicate key errors when SKUs are null/empty. Dropping it."
        );
      } else {
        console.log(
          "Index is not unique; will drop and recreate as partial unique to enforce uniqueness only for non-empty SKUs."
        );
      }
      try {
        await coll.dropIndex(existing.name);
        console.log(`Dropped index ${existing.name}`);
      } catch (err) {
        console.error(
          `Failed to drop index ${existing.name}:`,
          err.message || err
        );
        // Continue - we'll attempt to create the desired index which may fail if old index remains
      }
    } else {
      console.log("No existing index on variants.sku found.");
    }

    // Report problematic documents (variants with null or empty SKUs)
    const query = { "variants.sku": { $in: [null, ""] } };
    const count = await coll.countDocuments(query);
    console.log(`Documents with null/empty variant SKUs: ${count}`);
    if (count > 0) {
      console.log("Sample document ids (up to 20):");
      const sample = await coll
        .find(query)
        .project({ _id: 1 })
        .limit(20)
        .toArray();
      sample.forEach((d) => console.log(`  - ${d._id}`));
    }

    // Optional auto-fix
    const shouldFix = process.argv.includes("--fix");
    if (shouldFix && count > 0) {
      console.log(
        "Auto-fix enabled. Assigning deterministic placeholder SKUs to null/empty variant SKUs..."
      );
      const cursor = coll.find(query);
      let updated = 0;
      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        let changed = false;
        const variants = (doc.variants || []).map((v, idx) => {
          if (v && (!v.sku || v.sku === "")) {
            // deterministic placeholder using short id and variant index
            v.sku = `FIX-${doc._id.toString().slice(-6)}-${idx}`.toUpperCase();
            changed = true;
          }
          return v;
        });
        if (changed) {
          await coll.updateOne({ _id: doc._id }, { $set: { variants } });
          updated += 1;
        }
      }
      console.log(`Auto-fixed ${updated} documents.`);
    } else if (!shouldFix) {
      console.log(
        "Run with --fix to auto-assign placeholder SKUs (use only after inspecting samples)."
      );
    }

    // Create partial unique index on non-empty SKUs
    try {
      console.log("Creating partial unique index on variants.sku...");
      await coll.createIndex(
        { "variants.sku": 1 },
        {
          unique: true,
          partialFilterExpression: {
            "variants.sku": { $exists: true, $type: "string", $ne: "" },
          },
          name: "variants.sku_unique_partial",
        }
      );
      console.log("Partial unique index created: variants.sku_unique_partial");
    } catch (err) {
      console.error(
        "Failed to create partial unique index:",
        err.message || err
      );
      console.error(
        "If this fails due to existing duplicate SKUs, inspect and fix duplicates first."
      );
    }

    console.log("Done.");
  } catch (err) {
    console.error("Migration script error:", err);
  } finally {
    try {
      await client.close();
    } catch (e) {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
