// Utility functions for handling cookies without js-cookie dependency

// Cookie options interface
interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

// Helper functions
const isJson = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const isObject = (value: any): value is object =>
  value && typeof value === "object" && !Array.isArray(value);

// Function to prefix cookie keys
const getKey = (key: string): string => `fd_${key}`;

// Set cookie function
export const setCookie = (
  key: string,
  value: any,
  options: CookieOptions = {}
): void => {
  const cookieKey = getKey(key);
  const cookieValue = isObject(value) ? JSON.stringify(value) : String(value);

  // Default cookie options
  const defaults: CookieOptions = {
    path: "/",
    ...options,
  };

  // Create cookie string
  let cookieString = `${encodeURIComponent(cookieKey)}=${encodeURIComponent(
    cookieValue
  )}`;

  // Set options (expires, path, domain, secure, etc.)
  if (defaults.expires) {
    const date =
      typeof defaults.expires === "number"
        ? new Date(Date.now() + defaults.expires * 864e5) // days to milliseconds
        : defaults.expires;

    cookieString += `; expires=${date.toUTCString()}`;
  }
  if (defaults.path) cookieString += `; path=${defaults.path}`;
  if (defaults.domain) cookieString += `; domain=${defaults.domain}`;
  if (defaults.secure) cookieString += "; secure";
  if (defaults.sameSite) cookieString += `; samesite=${defaults.sameSite}`;

  document.cookie = cookieString;
};

// Get cookie function
export const getCookie = (key: string): any => {
  const cookieKey = getKey(key);
  const cookies = document.cookie
    .split("; ")
    .reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.split("=");
      if (name && value) {
        acc[decodeURIComponent(name)] = decodeURIComponent(value);
      }
      return acc;
    }, {});

  const value = cookies[cookieKey];
  if (!value) return undefined;

  return isJson(value) ? JSON.parse(value) : value;
};

// Delete cookie function
export const deleteCookie = (
  key: string,
  options: CookieOptions = {}
): void => {
  setCookie(key, "", { ...options, expires: -1 });
};

// Type-safe cookie functions for specific data types
export const setCookieTyped = <T>(
  key: string,
  value: T,
  options: CookieOptions = {}
): void => {
  setCookie(key, value, options);
};

export const getCookieTyped = <T>(key: string): T | undefined => {
  return getCookie(key) as T | undefined;
};

/*Examples
  
  // Import the cookie utility functions
  import { setCookie, getCookie, deleteCookie, setCookieTyped, getCookieTyped } from './cookies';
  
  // Example key and value
  const cookieKey = 'userPreferences';
  const cookieValue = { theme: 'dark', language: 'en' };
  
  // 1. Set a cookie
  // Setting a cookie with a key and value
  // Options can include `expires`, `path`, `domain`, `secure`, `sameSite`
  setCookie(cookieKey, cookieValue, { expires: 7, path: '/', secure: true, sameSite: 'Lax' });
  console.log('Cookie set:', document.cookie);
  
  // 2. Get a cookie
  // Retrieve the cookie value using the key
  const retrievedValue = getCookie(cookieKey);
  console.log('Retrieved Cookie Value:', retrievedValue); // Output: { theme: 'dark', language: 'en' }
  
  // 3. Delete a cookie
  // Deletes the cookie by setting its expiration date to the past
  deleteCookie(cookieKey, { path: '/' });
  console.log('Cookie after deletion:', document.cookie);
  
  // Check again if the cookie is deleted
  const afterDeletion = getCookie(cookieKey);
  console.log('Cookie Value After Deletion:', afterDeletion); // Output: undefined
  
  // 4. Type-safe cookie operations
  interface UserPreferences {
    theme: 'light' | 'dark';
    language: string;
  }
  
  setCookieTyped<UserPreferences>('userPrefs', { theme: 'dark', language: 'en' });
  const userPrefs = getCookieTyped<UserPreferences>('userPrefs');
  
  */
