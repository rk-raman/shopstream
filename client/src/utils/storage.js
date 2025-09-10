const isLocalStorageAvailable = typeof localStorage !== "undefined";
const isSessionStorageAvailable = typeof sessionStorage !== "undefined";

// Local Storage utilities
const localStorageUtils = {
  get: (key) => {
    try {
      const item = isLocalStorageAvailable ? localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get localStorage item '${key}':`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      if (isLocalStorageAvailable) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set localStorage item '${key}':`, error);
    }
  },

  remove: (key) => {
    try {
      if (isLocalStorageAvailable) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove localStorage item '${key}':`, error);
    }
  },

  clear: () => {
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
const sessionStorageUtils = {
  get: (key) => {
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

  set: (key, value) => {
    try {
      if (isSessionStorageAvailable) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set sessionStorage item '${key}':`, error);
    }
  },

  remove: (key) => {
    try {
      if (isSessionStorageAvailable) {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove sessionStorage item '${key}':`, error);
    }
  },

  clear: () => {
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
const createStorageInterface = (storageType) => {
  const isAvailable =
    storageType === "localStorage"
      ? isLocalStorageAvailable
      : isSessionStorageAvailable;

  const storage =
    storageType === "localStorage" ? localStorage : sessionStorage;

  return {
    get: (key) => {
      try {
        const item = isAvailable ? storage.getItem(key) : null;
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Failed to get ${storageType} item '${key}':`, error);
        return null;
      }
    },

    set: (key, value) => {
      try {
        if (isAvailable) {
          storage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Failed to set ${storageType} item '${key}':`, error);
      }
    },

    remove: (key) => {
      try {
        if (isAvailable) {
          storage.removeItem(key);
        }
      } catch (error) {
        console.error(`Failed to remove ${storageType} item '${key}':`, error);
      }
    },

    clear: () => {
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

export {
  localStorageUtils,
  sessionStorageUtils,
  createStorageInterface,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
};
