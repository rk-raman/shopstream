// Type definitions
type StorageType = "localStorage" | "sessionStorage";

interface StorageInterface {
  get<T = any>(key: string): T | null;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}

// Check if storage is available
const isLocalStorageAvailable: boolean = typeof localStorage !== "undefined";
const isSessionStorageAvailable: boolean =
  typeof sessionStorage !== "undefined";

// Local Storage utilities
const localStorageUtils: StorageInterface = {
  get: <T = any>(key: string): T | null => {
    try {
      const item = isLocalStorageAvailable ? localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get localStorage item '${key}':`, error);
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      if (isLocalStorageAvailable) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set localStorage item '${key}':`, error);
    }
  },

  remove: (key: string): void => {
    try {
      if (isLocalStorageAvailable) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove localStorage item '${key}':`, error);
    }
  },

  clear: (): void => {
    try {
      if (isLocalStorageAvailable) {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
};

// Session Storage utilities
const sessionStorageUtils: StorageInterface = {
  get: <T = any>(key: string): T | null => {
    try {
      const item = isSessionStorageAvailable
        ? sessionStorage.getItem(key)
        : null;
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get sessionStorage item '${key}':`, error);
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      if (isSessionStorageAvailable) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set sessionStorage item '${key}':`, error);
    }
  },

  remove: (key: string): void => {
    try {
      if (isSessionStorageAvailable) {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove sessionStorage item '${key}':`, error);
    }
  },

  clear: (): void => {
    try {
      if (isSessionStorageAvailable) {
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Failed to clear sessionStorage:", error);
    }
  },
};

// Generic storage interface (can work with either localStorage or sessionStorage)
const createStorageInterface = (storageType: StorageType): StorageInterface => {
  const isAvailable: boolean =
    storageType === "localStorage"
      ? isLocalStorageAvailable
      : isSessionStorageAvailable;

  const storage: Storage =
    storageType === "localStorage" ? localStorage : sessionStorage;

  return {
    get: <T = any>(key: string): T | null => {
      try {
        const item = isAvailable ? storage.getItem(key) : null;
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Failed to get ${storageType} item '${key}':`, error);
        return null;
      }
    },

    set: (key: string, value: any): void => {
      try {
        if (isAvailable) {
          storage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Failed to set ${storageType} item '${key}':`, error);
      }
    },

    remove: (key: string): void => {
      try {
        if (isAvailable) {
          storage.removeItem(key);
        }
      } catch (error) {
        console.error(`Failed to remove ${storageType} item '${key}':`, error);
      }
    },

    clear: (): void => {
      try {
        if (isAvailable) {
          storage.clear();
        }
      } catch (error) {
        console.error(`Failed to clear ${storageType}:`, error);
      }
    },
  };
};

// Export all utilities
export {
  localStorageUtils,
  sessionStorageUtils,
  createStorageInterface,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  type StorageInterface,
  type StorageType,
};

// Example usage with type safety:
/*
// Basic usage
localStorageUtils.set('user', { name: 'John', age: 30 });
const user = localStorageUtils.get<{ name: string; age: number }>('user');

// Using the factory function
const localStorage = createStorageInterface('localStorage');
localStorage.set('settings', { theme: 'dark', notifications: true });
const settings = localStorage.get<{ theme: string; notifications: boolean }>('settings');
*/
