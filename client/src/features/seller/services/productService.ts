import { ApiResponse, Product } from "@/types/global";
import { API_CONFIG } from "@/constants/constants";
import axiosSeller from "@/lib/api/axiosSeller";

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  stock: number;
  images: string[];
  tags?: string[];
  specifications?: Record<string, string>;
  isActive?: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ProductService {
  private baseURL = "/products";

  // Get all products with filters
  async getProducts(
    filters: ProductFilters = {}
  ): Promise<ApiResponse<ProductListResponse>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await axiosSeller.get(
        `${this.baseURL}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }

  // Get single product by ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosSeller.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }

  // Create new product
  async createProduct(
    productData: ProductFormData
  ): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosSeller.post(this.baseURL, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }

  // Update product
  async updateProduct(
    id: string,
    productData: Partial<ProductFormData>
  ): Promise<ApiResponse<Product>> {
    try {
      const response = await axiosSeller.put(
        `${this.baseURL}/${id}`,
        productData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosSeller.delete(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }

  // Bulk operations
  async bulkUpdateProducts(
    productIds: string[],
    updates: Partial<ProductFormData>
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await axiosSeller.patch(`${this.baseURL}/bulk`, {
        productIds,
        updates,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to bulk update products"
      );
    }
  }

  async bulkDeleteProducts(productIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await axiosSeller.delete(`${this.baseURL}/bulk`, {
        data: { productIds },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to bulk delete products"
      );
    }
  }

  // Get categories
  async getCategories(): Promise<
    ApiResponse<{ id: string; name: string; subcategories?: string[] }[]>
  > {
    try {
      const response = await axiosSeller.get("/categories");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }

  // Upload product images
  async uploadImages(files: File[]): Promise<ApiResponse<string[]>> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const response = await axiosSeller.post(
        "/uploads/product-images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to upload images"
      );
    }
  }
}

export const productService = new ProductService();
