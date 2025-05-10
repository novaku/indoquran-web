'use client';

import { useEffect } from 'react';
import offlineStorage from '@/utils/offlineStorage';

/**
 * Component that syncs offline data when the app comes online
 * Should be placed in a top-level layout or provider
 */
export default function OfflineDataSync() {
  useEffect(() => {
    // Function to sync offline contacts
    const syncOfflineContacts = async () => {
      try {
        // Only run this when we're online
        if (!navigator.onLine) return;
        
        console.log('Syncing offline contacts...');
        
        // Get all offline contacts that haven't been synced
        // Define a type for the contact object
        type Contact = {
          id: number;
          name: string;
          email: string;
          subject: string;
          message: string;
          synced: boolean;
        };
        
        // Get unsynced contacts from storage
        const unsynced = await offlineStorage.getOfflineContacts() as Contact[];
        const unsyncedContacts = unsynced.filter(contact => !contact.synced);
        
        if (unsyncedContacts.length === 0) {
          console.log('No offline contacts to sync');
          return;
        }
        console.log(`Found ${unsyncedContacts.length} offline contacts to sync`);
        
        // Try to sync each one
        for (const contact of unsyncedContacts) {
          try {
            const response = await fetch('/api/contact', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                message: contact.message,
              }),
            });
            
            if (response.ok) {
              // Mark as synced if successfully sent
              await offlineStorage.markContactSynced(Number(contact.id));
              console.log(`Synced offline contact ID: ${contact.id}`);
            } else {
              console.error(`Failed to sync contact ID: ${contact.id}`, await response.text());
            }
          } catch (error) {
            console.error(`Error syncing contact ID: ${contact.id}`, error);
          }
        }
      } catch (error) {
        console.error('Error syncing offline contacts:', error);
      }
    };
    
    // Sync when component mounts and we're online
    if (typeof window !== 'undefined' && navigator.onLine) {
      syncOfflineContacts();
    }
    
    // Set up event listener to sync when we come back online
    const handleOnline = () => {
      console.log('App is back online, syncing offline data...');
      syncOfflineContacts();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  // This is a background service component, it doesn't render anything
  return null;
}
