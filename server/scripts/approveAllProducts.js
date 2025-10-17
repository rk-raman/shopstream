const mongoose = require("mongoose");
const path = require("path");

// Load .env from the server root directory
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Adjust the path to your Product model
const Product = require("../src/modules/product/models/Product.model");

async function approveAllProducts() {
  try {
    console.log("🔧 Starting product approval process...\n");

    // Step 1: Count products that need approval
    const unapprovedCount = await Product.countDocuments({ isApproved: false });
    const totalCount = await Product.countDocuments();

    console.log("📊 Current Status:");
    console.log(`   Total products: ${totalCount}`);
    console.log(`   Unapproved products: ${unapprovedCount}`);
    console.log(`   Already approved: ${totalCount - unapprovedCount}\n`);

    if (unapprovedCount === 0) {
      console.log("✅ All products are already approved!");
      return;
    }

    // Step 2: Update all products to isApproved: true
    console.log("Step 1: Approving all products...");
    const result = await Product.updateMany(
      { isApproved: false },
      {
        $set: {
          isApproved: true,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} products`);

    // Step 3: Verify the update
    console.log("\nStep 2: Verifying update...");
    const remainingUnapproved = await Product.countDocuments({
      isApproved: false,
    });
    const nowApproved = await Product.countDocuments({ isApproved: true });

    console.log(`   Approved products: ${nowApproved}`);
    console.log(`   Unapproved products: ${remainingUnapproved}`);

    if (remainingUnapproved === 0) {
      console.log("\n✅ All products approved successfully!");
    } else {
      console.log(
        `\n⚠️  Warning: ${remainingUnapproved} products still unapproved`
      );
    }

    // Step 4: Show sample of approved products
    console.log("\nStep 3: Sample of approved products:");
    const sampleProducts = await Product.find({ isApproved: true })
      .limit(5)
      .select("name isApproved status updatedAt");

    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(
        `      Status: ${product.status} | Approved: ${product.isApproved}`
      );
    });

    console.log("\n📝 Summary:");
    console.log(`   ✓ ${result.modifiedCount} products were approved`);
    console.log(`   ✓ Total approved products: ${nowApproved}`);
    console.log(`   ✓ All products are now accessible to customers`);
  } catch (error) {
    console.error("\n❌ Approval failed:", error.message);
    console.error("\nFull error:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error("❌ Error: No MongoDB URI found!");
    console.error("Please set MONGODB_URI in your .env file");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...\n");

  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("✓ Connected to MongoDB\n");
      await approveAllProducts();
      await mongoose.disconnect();
      console.log("\n✓ Disconnected from MongoDB");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database connection error:", error.message);
      process.exit(1);
    });
}

module.exports = approveAllProducts;
