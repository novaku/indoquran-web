/**
 * Utility module for managing offline data storage using IndexedDB
 */

// Define database name and version
const DB_NAME = 'IndoQuranOfflineDB';
const DB_VERSION = 2; // Incremented to trigger database upgrade

// Database stores (tables)
const STORES = {
  QURAN: 'quran',
  BOOKMARKS: 'bookmarks',
  FAVORITES: 'favorites',
  READING_POSITION: 'readingPosition',
  STATIC_PAGES: 'staticPages',
  OFFLINE_CONTACTS: 'offlineContacts'
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
      
      if (!db.objectStoreNames.contains(STORES.STATIC_PAGES)) {
        db.createObjectStore(STORES.STATIC_PAGES, { keyPath: 'page_path' });
      }
      
      if (!db.objectStoreNames.contains(STORES.OFFLINE_CONTACTS)) {
        db.createObjectStore(STORES.OFFLINE_CONTACTS, { keyPath: 'id', autoIncrement: true });
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
  try {
    const db = await initDB();
    
    return new Promise<T[]>((resolve, reject) => {
      try {
        // First check if the store exists
        if (!db.objectStoreNames.contains(storeName)) {
          console.warn(`Store "${storeName}" not found in database. This may happen if your app was recently updated.`);
          resolve([]);
          db.close();
          return;
        }
        
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
      } catch (err) {
        console.error(`Error accessing store "${storeName}":`, err);
        resolve([]);
      }
    });
  } catch (err) {
    console.error(`Failed to initialize database for store "${storeName}":`, err);
    return [];
  }
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

// Maximum number of recent surahs to track for offline access
const MAX_RECENT_SURAHS = 10;

/**
 * Track a recently visited surah for offline access
 * @param surahId The ID of the surah that was visited
 */
export const trackRecentSurah = (surahId: number): void => {
  try {
    // Skip this functionality for server-side rendering
    if (typeof window === 'undefined') return;
    
    let recentSurahs: number[] = [];
    
    // Try to get existing recent surahs from localStorage
    const storedSurahs = localStorage.getItem('recentSurahs');
    if (storedSurahs) {
      try {
        const parsed = JSON.parse(storedSurahs);
        if (Array.isArray(parsed)) {
          recentSurahs = parsed;
        }
      } catch (e) {
        console.error('Failed to parse recent surahs from localStorage', e);
      }
    }
    
    // Remove the surahId if it already exists (to move it to the front)
    recentSurahs = recentSurahs.filter(id => id !== surahId);
    
    // Add the surahId to the front of the array
    recentSurahs.unshift(surahId);
    
    // Keep only the most recent MAX_RECENT_SURAHS
    if (recentSurahs.length > MAX_RECENT_SURAHS) {
      recentSurahs = recentSurahs.slice(0, MAX_RECENT_SURAHS);
    }
    
    // Save back to localStorage
    localStorage.setItem('recentSurahs', JSON.stringify(recentSurahs));
  } catch (e) {
    console.error('Error tracking recent surah', e);
  }
};

/**
 * Get the list of recently visited surahs
 * @returns Array of surah IDs or empty array if none
 */
export const getRecentSurahs = (): number[] => {
  try {
    // Skip this functionality for server-side rendering
    if (typeof window === 'undefined') return [];
    
    const storedSurahs = localStorage.getItem('recentSurahs');
    if (storedSurahs) {
      const parsed = JSON.parse(storedSurahs);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to get recent surahs', e);
  }
  
  return [];
};

/**
 * Save static page content for offline access
 * @param pagePath The path of the page (e.g., '/kontak', '/kebijakan-privasi')
 * @param content The content data to store
 */
export const saveStaticPage = <T>(pagePath: string, content: T) => {
  return saveData(STORES.STATIC_PAGES, {
    page_path: pagePath,
    content,
    timestamp: Date.now()
  });
};

/**
 * Get cached static page content
 * @param pagePath The path of the page to retrieve
 * @returns The cached page content or null if not found
 */
export const getStaticPage = async<T>(pagePath: string): Promise<T | null> => {
  const result = await getData<{ content: T }>(STORES.STATIC_PAGES, pagePath);
  return result ? result.content : null;
};

/**
 * Track recent static pages visited
 * @param pagePath The path of the page that was visited
 */
export const trackStaticPage = (pagePath: string): void => {
  try {
    // Skip for server-side rendering
    if (typeof window === 'undefined') return;
    
    let recentPages: string[] = [];
    
    // Try to get existing pages from localStorage
    const storedPages = localStorage.getItem('recentStaticPages');
    if (storedPages) {
      try {
        const parsed = JSON.parse(storedPages);
        if (Array.isArray(parsed)) {
          recentPages = parsed;
        }
      } catch (e) {
        console.error('Failed to parse recent static pages from localStorage', e);
      }
    }
    
    // Remove the page if it already exists (to move it to the front)
    recentPages = recentPages.filter(path => path !== pagePath);
    
    // Add the page path to the front of the array
    recentPages.unshift(pagePath);
    
    // Keep only the most recent pages (reuse same constant as surahs)
    if (recentPages.length > MAX_RECENT_SURAHS) {
      recentPages = recentPages.slice(0, MAX_RECENT_SURAHS);
    }
    
    // Save back to localStorage
    localStorage.setItem('recentStaticPages', JSON.stringify(recentPages));
  } catch (e) {
    console.error('Error tracking recent static page', e);
  }
};

/**
 * Get list of recently visited static pages
 * @returns Array of page paths or empty array if none
 */
export const getRecentStaticPages = (): string[] => {
  try {
    // Skip for server-side rendering
    if (typeof window === 'undefined') return [];
    
    const storedPages = localStorage.getItem('recentStaticPages');
    if (storedPages) {
      const parsed = JSON.parse(storedPages);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to get recent static pages', e);
  }
  
  return [];
};

/**
 * Check if the browser is currently offline
 * @returns boolean indicating online/offline status
 */
export const isOffline = (): boolean => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};

/**
 * Save offline contact message
 * @param contactData Contact form data
 */
export const saveOfflineContact = (contactData: any) => {
  return saveData(STORES.OFFLINE_CONTACTS, {
    ...contactData,
    synced: false,
    timestamp: Date.now()
  });
};

/**
 * Get all offline contact messages
 * @returns Array of unsynchronized contact messages
 */
export const getOfflineContacts = () => {
  return getAllData(STORES.OFFLINE_CONTACTS);
};

/**
 * Mark a contact message as synced
 * @param id The ID of the contact message to update
 */
export const markContactSynced = async (id: number): Promise<boolean> => {
  try {
    const contact = await getData(STORES.OFFLINE_CONTACTS, id);
    if (contact) {
      return !!await saveData(STORES.OFFLINE_CONTACTS, { ...contact, synced: true });
    }
    return false;
  } catch (error) {
    console.error('Error marking contact as synced:', error);
    return false;
  }
};

/**
 * Delete a synced contact message
 * @param id The ID of the contact message to delete
 */
export const deleteSyncedContact = (id: number) => {
  return deleteData(STORES.OFFLINE_CONTACTS, id);
};

// Export the storage utility object
const offlineStorage = {
  isOfflineSupported,
  isOffline,
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
  trackRecentSurah,
  getRecentSurahs,
  saveStaticPage,
  getStaticPage,
  trackStaticPage,
  getRecentStaticPages,
  clearStore,
  saveOfflineContact,
  getOfflineContacts,
  markContactSynced,
  deleteSyncedContact
};

export default offlineStorage;