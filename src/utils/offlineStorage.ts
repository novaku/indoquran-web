/**
 * Utility module for managing offline data storage using IndexedDB
 */

// Define database name and version
const DB_NAME = 'IndoQuranOfflineDB';
const DB_VERSION = 1;

// Database stores (tables)
const STORES = {
  QURAN: 'quran',
  BOOKMARKS: 'bookmarks',
  FAVORITES: 'favorites',
  READING_POSITION: 'readingPosition'
};

// Initialize database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject('IndexedDB not supported in this browser');
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Database error: ' + (event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.QURAN)) {
        db.createObjectStore(STORES.QURAN, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.BOOKMARKS)) {
        db.createObjectStore(STORES.BOOKMARKS, { keyPath: 'bookmark_id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
        db.createObjectStore(STORES.FAVORITES, { keyPath: 'favorite_id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains(STORES.READING_POSITION)) {
        db.createObjectStore(STORES.READING_POSITION, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to put data in a store
const saveData = async<T>(storeName: string, data: T): Promise<T> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => {
      resolve(data);
    };
    
    request.onerror = (event) => {
      reject('Error saving data: ' + (event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to get data from a store
const getData = async<T>(storeName: string, key: string | number): Promise<T | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      reject('Error getting data: ' + (event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to delete data from a store
const deleteData = async(storeName: string, key: string | number): Promise<boolean> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = (event) => {
      reject('Error deleting data: ' + (event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to get all data from a store
const getAllData = async<T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      reject('Error getting all data: ' + (event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Generic function to clear a store
const clearStore = async(storeName: string): Promise<boolean> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = (event) => {
      reject('Error clearing store: ' + (event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Specific functions for Quran data
export const saveQuranData = <T>(id: string | number, data: T) => {
  return saveData(STORES.QURAN, { id, data, timestamp: Date.now() });
};

export const getQuranData = async<T>(id: string | number): Promise<T | null> => {
  const result = await getData<{ data: T }>(STORES.QURAN, id);
  return result ? result.data : null;
};

// Specific functions for bookmarks
export const saveBookmark = (bookmarkData: any) => {
  return saveData(STORES.BOOKMARKS, {
    ...bookmarkData,
    synced: false, // Flag to indicate if synced with server
    timestamp: Date.now()
  });
};

export const getBookmarks = () => {
  return getAllData(STORES.BOOKMARKS);
};

export const deleteBookmark = (id: number) => {
  return deleteData(STORES.BOOKMARKS, id);
};

// Specific functions for favorites
export const saveFavorite = (favoriteData: any) => {
  return saveData(STORES.FAVORITES, {
    ...favoriteData,
    synced: false, // Flag to indicate if synced with server
    timestamp: Date.now()
  });
};

export const getFavorites = () => {
  return getAllData(STORES.FAVORITES);
};

export const deleteFavorite = (id: number) => {
  return deleteData(STORES.FAVORITES, id);
};

// Specific functions for reading position
export const saveReadingPosition = (userId: string, surahId: number, ayatNumber: number) => {
  return saveData(STORES.READING_POSITION, {
    id: userId || 'anonymous',
    surahId,
    ayatNumber,
    timestamp: Date.now()
  });
};

export const getReadingPosition = async(userId: string) => {
  return getData(STORES.READING_POSITION, userId || 'anonymous');
};

// Check if the browser supports offline capabilities
export const isOfflineSupported = () => {
  return 'indexedDB' in window && 'serviceWorker' in navigator;
};

// Export the storage utility object
const offlineStorage = {
  isOfflineSupported,
  saveQuranData,
  getQuranData,
  saveBookmark,
  getBookmarks,
  deleteBookmark,
  saveFavorite,
  getFavorites,
  deleteFavorite,
  saveReadingPosition,
  getReadingPosition,
  clearStore
};

export default offlineStorage;