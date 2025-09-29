import { useEffect, useState } from "react";

/**
 * useDebounce
 * Returns a debounced version of the provided value after the specified delay.
 *
 * @param {T} value - The value to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {T} - Debounced value
 * @template T
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
