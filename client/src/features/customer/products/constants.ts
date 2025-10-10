import { SortOption } from "./types";

export const SORT_OPTIONS: SortOption[] = [
  { value: "popularity", label: "Popularity" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest First" },
];

export const ITEMS_PER_PAGE = 12;
export const DEFAULT_PRICE_RANGE: [number, number] = [0, 2000];
