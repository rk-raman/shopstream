// Utility functions for handling cookies without js-cookie dependency

// Helper functions
const isJson = (value) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

// Function to prefix cookie keys
const getKey = (key) => `fd_${key}`;

// Set cookie function
export const setCookie = (key, value, options = {}) => {
  const cookieKey = getKey(key);
  const cookieValue = isObject(value) ? JSON.stringify(value) : value;

  // Default cookie options
  const defaults = {
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
export const getCookie = (key) => {
  const cookieKey = getKey(key);
  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    acc[decodeURIComponent(name)] = decodeURIComponent(value);
    return acc;
  }, {});

  const value = cookies[cookieKey];
  return isJson(value) ? JSON.parse(value) : value;
};

// Delete cookie function
export const deleteCookie = (key, options = {}) => {
  setCookie(key, "", { ...options, expires: -1 });
};

/*Examples
  
  // Import the cookie utility functions
  import { setCookie, getCookie, deleteCookie } from './cookieUtils';
  
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
  
  
  */
