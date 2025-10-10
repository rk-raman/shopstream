export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  inStock: boolean;
  image: string;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  minRating: number;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
