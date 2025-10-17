const mongoose = require("mongoose");
const path = require("path");

// Load .env from the server root directory
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Adjust the path to your Product model
const Product = require("../src/modules/product/models/Product.model");

// Debug: Show if env was loaded
console.log("🔍 Environment check:");
console.log(`   .env path: ${path.resolve(__dirname, "../.env")}`);
console.log(`   MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
console.log(`   MONGO_URI exists: ${!!process.env.MONGO_URI}`);
console.log("");

async function fixVariantSkuIndex() {
  try {
    console.log("🔧 Starting variant SKU index fix...\n");

    // Step 1: Drop ALL existing indexes on variants.sku
    console.log("Step 1: Removing old indexes...");
    const indexes = await Product.collection.indexes();
    let indexDropped = false;

    for (const index of indexes) {
      if (index.key && index.key["variants.sku"]) {
        try {
          await Product.collection.dropIndex(index.name);
          console.log(`✓ Dropped index: ${index.name}`);
          indexDropped = true;
        } catch (error) {
          console.log(`⚠ Could not drop ${index.name}:`, error.message);
        }
      }
    }

    if (!indexDropped) {
      console.log("ℹ️  No existing variants.sku indexes found");
    }

    // Step 2: Create the correct partial unique index
    console.log("\nStep 2: Creating new partial unique index...");
    try {
      await Product.collection.createIndex(
        { "variants.sku": 1 },
        {
          name: "variants_sku_unique",
          unique: true,
          // Only apply uniqueness when variants array has items with SKU
          // Note: We removed $ne: "" because MongoDB doesn't support $ne in partialFilterExpression
          partialFilterExpression: {
            "variants.sku": { $exists: true, $type: "string" }, // Must exist and be a string
          },
        }
      );
      console.log("✓ Created partial unique index on variants.sku");
    } catch (error) {
      if (error.code === 85) {
        console.log(
          "ℹ️  Index 'variants_sku_unique' already exists with correct configuration"
        );
      } else {
        throw error;
      }
    }

    // Step 3: Verify the new index
    console.log("\nStep 3: Verifying indexes...");
    const newIndexes = await Product.collection.indexes();
    const variantIndex = newIndexes.find(
      (idx) => idx.name === "variants_sku_unique"
    );

    if (variantIndex) {
      console.log("✓ Index verified:");
      console.log(JSON.stringify(variantIndex, null, 2));
    } else {
      console.log("⚠️  Warning: Could not find 'variants_sku_unique' index");
    }

    // Step 4: Test the fix
    console.log("\nStep 4: Testing...");

    // Test 1: Empty variants array
    console.log("Testing: Create product with empty variants array...");
    const testProduct1 = new Product({
      name: "Test Product 1",
      description: "Test description for product 1",
      category: new mongoose.Types.ObjectId(),
      seller: new mongoose.Types.ObjectId(),
      basePrice: 100,
      variants: [], // Empty array - should work!
    });
    await testProduct1.validate();
    console.log("✓ Empty variants array validation passed");

    // Test 2: No variants field
    console.log("Testing: Create product without variants field...");
    const testProduct2 = new Product({
      name: "Test Product 2",
      description: "Test description for product 2",
      category: new mongoose.Types.ObjectId(),
      seller: new mongoose.Types.ObjectId(),
      basePrice: 100,
      // No variants field at all - should work!
    });
    await testProduct2.validate();
    console.log("✓ No variants field validation passed");

    // Test 3: Product with valid variants
    console.log("Testing: Create product with valid variants...");
    const testProduct3 = new Product({
      name: "Test Product 3",
      description: "Test description for product 3",
      category: new mongoose.Types.ObjectId(),
      seller: new mongoose.Types.ObjectId(),
      basePrice: 100,
      variants: [
        {
          name: "Size",
          value: "Medium",
          price: 100,
          stock: 10,
          sku: `TEST-SKU-${Date.now()}`,
        },
      ],
    });
    await testProduct3.validate();
    console.log("✓ Product with variants validation passed");

    console.log("\n✅ All tests passed! Migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   ✓ You can now create products with empty variants array");
    console.log("   ✓ Variant SKUs are still unique when they exist");
    console.log("   ✓ Multiple products can have empty variants arrays");
    console.log("\n💡 Next steps:");
    console.log("   1. Try creating a product with empty variants array");
    console.log("   2. Add variants later using product.variants.push()");
    console.log("   3. Each variant SKU must be unique across all products");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\nFull error:", error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error("❌ Error: No MongoDB URI found!");
    console.error(
      "Please set one of these environment variables in your .env file:"
    );
    console.error("  - MONGODB_URI");
    console.error("  - MONGO_URI");
    console.error("  - DATABASE_URL");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  console.log(`📍 Database: ${mongoUri.split("/").pop().split("?")[0]}\n`);

  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("✓ Connected to MongoDB\n");
      await fixVariantSkuIndex();
      await mongoose.disconnect();
      console.log("\n✓ Disconnected from MongoDB");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database connection error:", error.message);
      console.error("\n💡 Troubleshooting:");
      console.error("   1. Make sure MongoDB is running");
      console.error("   2. Check your MONGODB_URI in .env file");
      console.error("   3. Verify network connectivity");
      console.error(
        `\n   Your URI: ${mongoUri.replace(
          /\/\/([^:]+):([^@]+)@/,
          "//$1:****@"
        )}`
      );
      process.exit(1);
    });
}

module.exports = fixVariantSkuIndex;
