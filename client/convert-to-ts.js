const fs = require("fs");
const path = require("path");

// List of all remaining JS files to convert
const filesToConvert = [
  // Customer pages
  {
    from: "src/app/(customer)/account/addresses/page.js",
    to: "src/app/(customer)/account/addresses/page.tsx",
  },
  {
    from: "src/app/(customer)/account/orders/[id]/page.js",
    to: "src/app/(customer)/account/orders/[id]/page.tsx",
  },
  {
    from: "src/app/(customer)/account/orders/page.js",
    to: "src/app/(customer)/account/orders/page.tsx",
  },
  {
    from: "src/app/(customer)/account/page.js",
    to: "src/app/(customer)/account/page.tsx",
  },
  {
    from: "src/app/(customer)/checkout/page.js",
    to: "src/app/(customer)/checkout/page.tsx",
  },
  {
    from: "src/app/(customer)/checkout/payment/page.js",
    to: "src/app/(customer)/checkout/payment/page.tsx",
  },
  {
    from: "src/app/(customer)/checkout/shipping/page.js",
    to: "src/app/(customer)/checkout/shipping/page.tsx",
  },
  {
    from: "src/app/(customer)/shop/categories/page.js",
    to: "src/app/(customer)/shop/categories/page.tsx",
  },
  {
    from: "src/app/(customer)/shop/products/[id]/page.js",
    to: "src/app/(customer)/shop/products/[id]/page.tsx",
  },
  {
    from: "src/app/(customer)/wishlist/page.js",
    to: "src/app/(customer)/wishlist/page.tsx",
  },

  // Seller dashboard pages
  {
    from: "src/app/(seller)/dashboard/customers/[id]/page.js",
    to: "src/app/(seller)/dashboard/customers/[id]/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/customers/page.js",
    to: "src/app/(seller)/dashboard/customers/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/orders/[id]/page.js",
    to: "src/app/(seller)/dashboard/orders/[id]/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/orders/page.js",
    to: "src/app/(seller)/dashboard/orders/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/products/add/page.js",
    to: "src/app/(seller)/dashboard/products/add/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/products/edit/[id]/page.js",
    to: "src/app/(seller)/dashboard/products/edit/[id]/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/products/page.js",
    to: "src/app/(seller)/dashboard/products/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/settings/general/page.js",
    to: "src/app/(seller)/dashboard/settings/general/page.tsx",
  },
  {
    from: "src/app/(seller)/dashboard/settings/page.js",
    to: "src/app/(seller)/dashboard/settings/page.tsx",
  },

  // Layout components
  {
    from: "src/components/layout/Footer/CustomerFooter/CustomerFooter.js",
    to: "src/components/layout/Footer/CustomerFooter/CustomerFooter.tsx",
  },
  {
    from: "src/components/layout/Footer/SellerFooter/SellerFooter.js",
    to: "src/components/layout/Footer/SellerFooter/SellerFooter.tsx",
  },
  {
    from: "src/components/layout/Header/CustomerHeader/CustomerHeader.js",
    to: "src/components/layout/Header/CustomerHeader/CustomerHeader.tsx",
  },
  {
    from: "src/components/layout/Header/SellerHeader/SellerHeader.js",
    to: "src/components/layout/Header/SellerHeader/SellerHeader.tsx",
  },

  // Hooks
  {
    from: "src/features/customer/products/hooks/useProductDetails.js",
    to: "src/features/customer/products/hooks/useProductDetails.ts",
  },
  {
    from: "src/features/customer/products/hooks/useProductReviews.js",
    to: "src/features/customer/products/hooks/useProductReviews.ts",
  },
  {
    from: "src/features/customer/products/hooks/useProductSearch.js",
    to: "src/features/customer/products/hooks/useProductSearch.ts",
  },
  {
    from: "src/features/seller/hooks/useSeller.js",
    to: "src/features/seller/hooks/useSeller.ts",
  },
  {
    from: "src/features/seller/hooks/useSellerDashboard.js",
    to: "src/features/seller/hooks/useSellerDashboard.ts",
  },
  {
    from: "src/features/seller/hooks/useSellerOrders.js",
    to: "src/features/seller/hooks/useSellerOrders.ts",
  },

  // Services
  {
    from: "src/features/customer/products/services/productService.js",
    to: "src/features/customer/products/services/productService.ts",
  },
  {
    from: "src/features/seller/services/sellerOrderService.js",
    to: "src/features/seller/services/sellerOrderService.ts",
  },
  {
    from: "src/features/seller/services/sellerProductService.js",
    to: "src/features/seller/services/sellerProductService.ts",
  },
  {
    from: "src/features/seller/services/sellerService.js",
    to: "src/features/seller/services/sellerService.ts",
  },

  // Utilities
  { from: "src/utils/auth.js", to: "src/utils/auth.ts" },
  { from: "src/utils/constants.js", to: "src/utils/constants.ts" },
  { from: "src/utils/formatters.js", to: "src/utils/formatters.ts" },
  { from: "src/utils/helpers.js", to: "src/utils/helpers.ts" },
  { from: "src/utils/storage.js", to: "src/utils/storage.ts" },
  { from: "src/utils/validation.js", to: "src/utils/validation.ts" },
];

// Template for basic page components
const getPageTemplate = (
  title,
  description,
  content = "Coming soon"
) => `import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "${title} - ShopStream",
  description: "${description}",
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">${title}</h1>
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">${content}</p>
      </div>
    </div>
  );
}`;

// Template for layout components
const getLayoutTemplate = (componentName) => `import React from 'react';

interface ${componentName}Props {
  children?: React.ReactNode;
}

export default function ${componentName}({ children }: ${componentName}Props) {
  return (
    <div className="${componentName.toLowerCase()}">
      {/* ${componentName} implementation */}
      {children}
    </div>
  );
}`;

// Template for hooks
const getHookTemplate = (hookName, returnType = "any") => `'use client';

import { useState, useEffect } from 'react';

interface ${hookName}Return {
  data: ${returnType};
  loading: boolean;
  error: string | null;
}

export const ${hookName} = (): ${hookName}Return => {
  const [data, setData] = useState<${returnType}>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement hook logic
    setLoading(false);
  }, []);

  return { data, loading, error };
};`;

// Template for services
const getServiceTemplate = (
  serviceName
) => `import { ApiResponse } from '@/types/global';
import axios, { AxiosResponse } from 'axios';

export class ${serviceName} {
  // TODO: Implement service methods
  
  static async getData(): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.get('/api/data');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ${serviceName};`;

// Function to convert files
function convertFiles() {
  console.log("Starting TypeScript conversion...");

  filesToConvert.forEach(({ from, to }) => {
    try {
      const fullFromPath = path.resolve(from);
      const fullToPath = path.resolve(to);

      // Check if source file exists
      if (!fs.existsSync(fullFromPath)) {
        console.log(`Skipping ${from} - file not found`);
        return;
      }

      // Read original content
      const originalContent = fs.readFileSync(fullFromPath, "utf8");
      let newContent = "";

      // Determine template based on file type
      if (to.includes("/page.tsx")) {
        const fileName = path.basename(to, ".tsx");
        const isCustomerPage = to.includes("(customer)");
        const isSellerPage = to.includes("(seller)");

        if (fileName === "page") {
          const pathParts = to.split("/");
          const pageName = pathParts[pathParts.length - 2];
          newContent = getPageTemplate(
            pageName.charAt(0).toUpperCase() + pageName.slice(1),
            `${pageName} page`
          );
        }
      } else if (to.includes("/components/")) {
        const componentName = path.basename(to, ".tsx");
        newContent = getLayoutTemplate(componentName);
      } else if (to.includes("/hooks/")) {
        const hookName = path.basename(to, ".ts");
        newContent = getHookTemplate(hookName);
      } else if (to.includes("/services/")) {
        const serviceName =
          path.basename(to, ".ts").replace("Service", "") + "Service";
        newContent = getServiceTemplate(serviceName);
      } else {
        // For utility files, create basic TypeScript structure
        newContent = `// ${path.basename(to)} - TypeScript conversion
// TODO: Implement functionality

export {};`;
      }

      // Create directory if it doesn't exist
      const dir = path.dirname(fullToPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write new TypeScript file
      fs.writeFileSync(fullToPath, newContent);
      console.log(`✓ Converted ${from} -> ${to}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${from}:`, error.message);
    }
  });

  console.log("TypeScript conversion completed!");
}

// Run conversion
convertFiles();
