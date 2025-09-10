const fs = require("fs");
const path = require("path");

// List of JS files to delete (same as conversion script)
const jsFilesToDelete = [
  // Customer pages
  "src/app/(customer)/account/addresses/page.js",
  "src/app/(customer)/account/orders/[id]/page.js",
  "src/app/(customer)/account/orders/page.js",
  "src/app/(customer)/account/page.js",
  "src/app/(customer)/checkout/page.js",
  "src/app/(customer)/checkout/payment/page.js",
  "src/app/(customer)/checkout/shipping/page.js",
  "src/app/(customer)/shop/categories/page.js",
  "src/app/(customer)/shop/products/[id]/page.js",
  "src/app/(customer)/wishlist/page.js",

  // Seller dashboard pages
  "src/app/(seller)/dashboard/customers/[id]/page.js",
  "src/app/(seller)/dashboard/customers/page.js",
  "src/app/(seller)/dashboard/orders/[id]/page.js",
  "src/app/(seller)/dashboard/orders/page.js",
  "src/app/(seller)/dashboard/products/add/page.js",
  "src/app/(seller)/dashboard/products/edit/[id]/page.js",
  "src/app/(seller)/dashboard/products/page.js",
  "src/app/(seller)/dashboard/settings/general/page.js",
  "src/app/(seller)/dashboard/settings/page.js",

  // Layout components
  "src/components/layout/Footer/CustomerFooter/CustomerFooter.js",
  "src/components/layout/Footer/SellerFooter/SellerFooter.js",
  "src/components/layout/Header/CustomerHeader/CustomerHeader.js",
  "src/components/layout/Header/SellerHeader/SellerHeader.js",

  // Hooks
  "src/features/customer/products/hooks/useProductDetails.js",
  "src/features/customer/products/hooks/useProductReviews.js",
  "src/features/customer/products/hooks/useProductSearch.js",
  "src/features/seller/hooks/useSeller.js",
  "src/features/seller/hooks/useSellerDashboard.js",
  "src/features/seller/hooks/useSellerOrders.js",

  // Services
  "src/features/customer/products/services/productService.js",
  "src/features/seller/services/sellerOrderService.js",
  "src/features/seller/services/sellerProductService.js",
  "src/features/seller/services/sellerService.js",

  // Utilities
  "src/utils/auth.js",
  "src/utils/constants.js",
  "src/utils/formatters.js",
  "src/utils/helpers.js",
  "src/utils/storage.js",
  "src/utils/validation.js",
];

// Function to safely delete JS files
function deleteJSFiles() {
  console.log("Starting JavaScript file deletion...");
  console.log("⚠️  WARNING: This will permanently delete JavaScript files!");
  console.log(
    "Make sure you have successfully converted them to TypeScript first.\n"
  );

  let deletedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  jsFilesToDelete.forEach((filePath) => {
    try {
      const fullPath = path.resolve(filePath);

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skipping ${filePath} - file not found`);
        skippedCount++;
        return;
      }

      // Check if corresponding TypeScript file exists
      const tsPath = filePath.replace(
        /\.js$/,
        filePath.includes("/page.js") ? ".tsx" : ".ts"
      );
      const fullTsPath = path.resolve(tsPath);

      if (!fs.existsSync(fullTsPath)) {
        console.log(
          `⚠️  Skipping ${filePath} - TypeScript version not found at ${tsPath}`
        );
        skippedCount++;
        return;
      }

      // Delete the JavaScript file
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted ${filePath}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ Failed to delete ${filePath}:`, error.message);
      errorCount++;
    }
  });

  console.log("\n📊 Deletion Summary:");
  console.log(`✅ Files deleted: ${deletedCount}`);
  console.log(`⏭️  Files skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log("\nJavaScript file deletion completed!");
}

// Safety check function
function confirmDeletion() {
  console.log("🔍 Pre-deletion safety check...");

  let tsFilesFound = 0;
  let jsFilesFound = 0;

  jsFilesToDelete.forEach((filePath) => {
    const fullPath = path.resolve(filePath);
    const tsPath = filePath.replace(
      /\.js$/,
      filePath.includes("/page.js") ? ".tsx" : ".ts"
    );
    const fullTsPath = path.resolve(tsPath);

    if (fs.existsSync(fullPath)) {
      jsFilesFound++;
    }

    if (fs.existsSync(fullTsPath)) {
      tsFilesFound++;
    }
  });

  console.log(`📁 JavaScript files found: ${jsFilesFound}`);
  console.log(`📁 TypeScript files found: ${tsFilesFound}`);

  if (tsFilesFound === 0) {
    console.log(
      "❌ ERROR: No TypeScript files found! Run the conversion script first."
    );
    return false;
  }

  if (jsFilesFound === 0) {
    console.log("ℹ️  No JavaScript files to delete.");
    return false;
  }

  console.log("✅ Safety check passed. Ready to delete JavaScript files.\n");
  return true;
}

// Main execution
if (confirmDeletion()) {
  deleteJSFiles();
} else {
  console.log("🛑 Deletion cancelled for safety reasons.");
}
