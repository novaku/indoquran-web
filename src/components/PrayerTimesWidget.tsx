'use client';

import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { id } from 'date-fns/locale';
import { requestNotificationPermission, schedulePrayerNotification } from '@/utils/notifications';
import Tooltip from '@/components/Tooltip';
import LazyLoadImage from '@/components/LazyLoadImage';

interface PrayerTime {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimeResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
      gregorian: {
        date: string;
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: {
          Fajr: number;
          Isha: number;
        };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: {
        Imsak: number;
        Fajr: number;
        Sunrise: number;
        Dhuhr: number;
        Asr: number;
        Maghrib: number;
        Sunset: number;
        Isha: number;
        Midnight: number;
      };
    };
  };
}

interface LocationInfo {
  city: string;
  region: string;
  country: string;
}

const defaultCoords = {
  latitude: -6.1753924, // Jakarta Pusat
  longitude: 106.8271528,
};

const PrayerTimesWidget: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [nextPrayer, setNextPrayer] = useState<{name: string; time: string} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState(defaultCoords);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [notificationTimers, setNotificationTimers] = useState<number[]>([]);
  
  // Format time from 24h to 12h format
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };
  
  // Get city name from coordinates
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await response.json();
      
      if (data && data.address) {
        setLocation({
          city: data.address.city || data.address.town || data.address.village || 'Unknown',
          region: data.address.state || '',
          country: data.address.country || 'Indonesia'
        });
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({
        city: 'Jakarta Pusat',
        region: 'Jakarta',
        country: 'Indonesia'
      });
    }
  };

  // Calculate next prayer
  const calculateNextPrayer = (times: PrayerTime) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const prayerTimesInMinutes = {
      Subuh: getTimeInMinutes(times.fajr),
      Dzuhur: getTimeInMinutes(times.dhuhr),
      Ashar: getTimeInMinutes(times.asr),
      Maghrib: getTimeInMinutes(times.maghrib),
      Isya: getTimeInMinutes(times.isha)
    };
    
    let nextPrayerName = '';
    let nextPrayerTime = '';
    let minDiff = Infinity;
    
    for (const [name, timeInMinutes] of Object.entries(prayerTimesInMinutes)) {
      if (timeInMinutes > currentTimeInMinutes && timeInMinutes - currentTimeInMinutes < minDiff) {
        minDiff = timeInMinutes - currentTimeInMinutes;
        nextPrayerName = name;
        nextPrayerTime = Object.entries(times).find(
          ([key]) => key.toLowerCase() === name.toLowerCase() || 
                    (key === 'fajr' && name === 'Subuh') || 
                    (key === 'dhuhr' && name === 'Dzuhur') || 
                    (key === 'asr' && name === 'Ashar') || 
                    (key === 'isha' && name === 'Isya')
        )?.[1] || '';
      }
    }
    
    // If no next prayer found today, the next prayer is Fajr tomorrow
    if (!nextPrayerName) {
      nextPrayerName = 'Subuh';
      nextPrayerTime = times.fajr;
    }
    
    setNextPrayer({
      name: nextPrayerName,
      time: nextPrayerTime
    });
  };
  
  // Convert time string to minutes
  const getTimeInMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get user location
  useEffect(() => {
    const getUserLocation = () => {
      // Check if user has set a preference
      const useAutoLocationStr = localStorage.getItem('useAutoLocation');
      const useAutoLocation = useAutoLocationStr === null || useAutoLocationStr === 'true';
      
      if (useAutoLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            getLocationName(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            useDefaultLocation();
          },
          { timeout: 10000 }
        );
      } else {
        useDefaultLocation();
      }
    };
    
    const useDefaultLocation = () => {
      setCoordinates(defaultCoords);
      getLocationName(defaultCoords.latitude, defaultCoords.longitude);
    };
    
    getUserLocation();
    
    // Set up clock
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    
    // Listen for location preference changes
    const handleLocationPreferenceChange = (event: CustomEvent) => {
      if (event.detail?.useAutoLocation) {
        getUserLocation();
      } else {
        useDefaultLocation();
      }
    };
    
    window.addEventListener('locationPreferenceChanged', 
      handleLocationPreferenceChange as EventListener);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('locationPreferenceChanged', 
        handleLocationPreferenceChange as EventListener);
    };
  }, []);

  // Request notification permission and load settings from localStorage
  useEffect(() => {
    const checkNotificationPermission = async () => {
      // Check local storage first for saved preference
      const savedPreference = localStorage.getItem('prayerNotificationsEnabled');
      
      // If user previously enabled notifications, check permission
      if (savedPreference === 'true') {
        const isGranted = await requestNotificationPermission();
        setNotificationsEnabled(isGranted);
      } else if (savedPreference === 'false') {
        // User explicitly disabled notifications
        setNotificationsEnabled(false);
      } else {
        // No preference saved, don't request permissions automatically
        setNotificationsEnabled(false);
      }
    };
    
    checkNotificationPermission();
  }, []);
  
  // Schedule notifications for prayer times
  const schedulePrayerNotifications = (prayerTimes: PrayerTime) => {
    if (!notificationsEnabled) return;
    
    // Clear any existing notification timers
    notificationTimers.forEach(timerId => clearTimeout(timerId));
    
    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Schedule notifications for each prayer
    const newTimers: number[] = [];
    
    const prayers = [
      { name: 'Subuh', time: prayerTimes.fajr },
      { name: 'Dzuhur', time: prayerTimes.dhuhr },
      { name: 'Ashar', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isya', time: prayerTimes.isha }
    ];
    
    prayers.forEach(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours);
      prayerDate.setMinutes(minutes);
      prayerDate.setSeconds(0);
      
      // Only schedule notifications for future prayer times
      if (prayerDate > new Date()) {
        const timerId = schedulePrayerNotification(prayer.name, prayerDate, 5);
        if (timerId > 0) {
          newTimers.push(timerId);
        }
      }
    });
    
    setNotificationTimers(newTimers);
  };
  
  // Fetch prayer times
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setIsLoading(true);
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=11`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch prayer times');
        }
        
        const data: PrayerTimeResponse = await response.json();
        
        const times = {
          fajr: formatTime(data.data.timings.Fajr),
          dhuhr: formatTime(data.data.timings.Dhuhr),
          asr: formatTime(data.data.timings.Asr),
          maghrib: formatTime(data.data.timings.Maghrib),
          isha: formatTime(data.data.timings.Isha)
        };
        
        setPrayerTimes(times);
        
        // Schedule notifications for prayer times
        if (notificationsEnabled) {
          schedulePrayerNotifications(times);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setError('Gagal memuat jadwal sholat');
        setIsLoading(false);
      }
    };
    
    fetchPrayerTimes();
  }, [coordinates, notificationsEnabled]);

  // Calculate next prayer whenever prayer times or current time changes
  useEffect(() => {
    if (prayerTimes) {
      calculateNextPrayer(prayerTimes);
    }
  }, [prayerTimes, currentDate]);
  
  // Clean up notification timers and event listeners when component unmounts
  useEffect(() => {
    return () => {
      notificationTimers.forEach(timerId => clearTimeout(timerId));
      
      // Also remove any event listeners that might be attached
      window.removeEventListener('locationPreferenceChanged', 
        ((event: CustomEvent) => {}) as EventListener);
    };
  }, [notificationTimers]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-tr from-amber-50 to-amber-100 rounded-lg p-4 shadow-md w-full animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 bg-amber-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-amber-200 rounded w-1/5"></div>
        </div>
        
        <div className="flex justify-between mb-3">
          <div className="h-4 bg-amber-200 rounded w-1/3 mb-1"></div>
          <div className="h-4 bg-amber-200 rounded w-1/4 mb-1"></div>
        </div>
        
        <div className="h-12 bg-amber-200/60 rounded-md mb-4"></div>
        
        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-amber-200/60 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-tr from-amber-50 to-amber-100 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 shadow-md w-full">
        <h3 className="font-semibold text-xl text-amber-800 dark:text-amber-400 mb-2 flex items-center">
          <LazyLoadImage 
            src="/icons/prayer-icon.svg"
            alt="Prayer Times"
            className="w-5 h-5 mr-2"
            width={20}
            height={20}
          />
          Jadwal Sholat
        </h3>
        <div className="text-red-600 dark:text-red-400 mb-3 bg-red-100 dark:bg-red-900/30 p-3 rounded border-l-4 border-red-500 dark:border-red-600">
          <p className="font-medium mb-1">{error}</p>
          <p className="text-sm text-red-700 dark:text-red-300">Pastikan perangkat Anda terhubung ke internet.</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white py-2 px-4 rounded text-sm transition-colors flex items-center"
        >
          <LazyLoadImage 
            src="/icons/tentang-icon.svg"
            alt="Refresh"
            className="w-4 h-4 mr-1"
            width={16}
            height={16}
          />
          Coba Lagi
        </button>
      </div>
    );
  }

  // Toggle notification permissions
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // Disable notifications in our app state
      setNotificationsEnabled(false);
      
      // Save preference to localStorage
      localStorage.setItem('prayerNotificationsEnabled', 'false');
      
      // Clear existing notification timers
      notificationTimers.forEach(timerId => clearTimeout(timerId));
      setNotificationTimers([]);
    } else {
      // Request permission
      const isGranted = await requestNotificationPermission();
      
      if (isGranted) {
        setNotificationsEnabled(true);
        
        // Save preference to localStorage
        localStorage.setItem('prayerNotificationsEnabled', 'true');
        
        // Schedule notifications if we have prayer times
        if (prayerTimes) {
          schedulePrayerNotifications(prayerTimes);
        }
      }
    }
  };

  return (
    <div className="bg-gradient-to-tr from-amber-50 to-amber-100 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 shadow-md w-full transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-wrap justify-between items-start mb-2">
        <h3 className="font-semibold text-xl text-amber-800 dark:text-amber-400 flex items-center">
          <LazyLoadImage 
            src="/icons/prayer-icon.svg"
            alt="Prayer Times"
            className="w-5 h-5 mr-2"
            width={20}
            height={20}
          />
          Jadwal Sholat
        </h3>
        <div className="flex items-center gap-2">
          <Tooltip text={notificationsEnabled ? 'Nonaktifkan notifikasi sholat' : 'Aktifkan notifikasi sholat'}>
            <button 
              onClick={toggleNotifications} 
              className={`p-1 rounded-full ${
                notificationsEnabled 
                  ? 'bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-200' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                } transition-all duration-300`}
              aria-label={notificationsEnabled ? 'Nonaktifkan notifikasi sholat' : 'Aktifkan notifikasi sholat'}
            >
              <LazyLoadImage
                src={notificationsEnabled ? "/icons/prayer-icon.svg" : "/icons/prayer-icon.svg"}
                alt={notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
                className="w-4 h-4"
                width={16}
                height={16}
              />
            </button>
          </Tooltip>
          <div className="text-amber-900 dark:text-amber-300 font-medium text-sm">
            {format(currentDate, 'HH:mm:ss', { locale: id })}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between mb-3">
        {location && (
          <div className="text-sm text-amber-700 dark:text-amber-400 flex items-center mr-3 mb-1">
            <LazyLoadImage 
              src="/icons/prayer-icon.svg"
              alt="Location"
              className="w-4 h-4 mr-1"
              width={16}
              height={16}
            />
            {location.city}, {location.region}
          </div>
        )}
        
        <div className="text-sm text-amber-900 dark:text-amber-300 flex items-center mb-1">
          <LazyLoadImage 
            src="/icons/tentang-icon.svg"
            alt="Calendar"
            className="w-4 h-4 mr-1"
            width={16}
            height={16}
          />
          {format(currentDate, 'EEEE, d MMMM yyyy', { locale: id })}
        </div>
      </div>
      
      {nextPrayer && (
        <div className="mb-4 bg-gradient-to-r from-amber-200/80 to-amber-100/80 dark:from-amber-900/60 dark:to-amber-800/60 rounded-md p-3 border-l-4 border-amber-500 dark:border-amber-600 shadow-sm">
          <div className="text-xs text-amber-800 dark:text-amber-300 uppercase font-semibold mb-1">Waktu sholat berikutnya</div>
          <div className="font-bold text-amber-900 dark:text-amber-200 flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
              <span>{nextPrayer.name}</span>
            </div>
            <span className="bg-amber-500/20 dark:bg-amber-500/30 py-1 px-3 rounded-full text-amber-900 dark:text-amber-100">{nextPrayer.time}</span>
          </div>
        </div>
      )}
      
      {prayerTimes && (
        <div className="border-t border-amber-200/50 dark:border-amber-700/50 pt-3">
          <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-5 gap-2 text-sm">
            <div className="bg-amber-100/70 dark:bg-amber-800/50 rounded p-2 flex flex-col items-center justify-center">
              <div className="text-amber-800 dark:text-amber-200 text-xs uppercase font-medium">Subuh</div>
              <div className="font-bold text-amber-900 dark:text-amber-100">{prayerTimes.fajr}</div>
            </div>
            
            <div className="bg-amber-100/70 dark:bg-amber-800/50 rounded p-2 flex flex-col items-center justify-center">
              <div className="text-amber-800 dark:text-amber-200 text-xs uppercase font-medium">Dzuhur</div>
              <div className="font-bold text-amber-900 dark:text-amber-100">{prayerTimes.dhuhr}</div>
            </div>
            
            <div className="bg-amber-100/70 dark:bg-amber-800/50 rounded p-2 flex flex-col items-center justify-center">
              <div className="text-amber-800 dark:text-amber-200 text-xs uppercase font-medium">Ashar</div>
              <div className="font-bold text-amber-900 dark:text-amber-100">{prayerTimes.asr}</div>
            </div>
            
            <div className="bg-amber-100/70 dark:bg-amber-800/50 rounded p-2 flex flex-col items-center justify-center">
              <div className="text-amber-800 dark:text-amber-200 text-xs uppercase font-medium">Maghrib</div>
              <div className="font-bold text-amber-900 dark:text-amber-100">{prayerTimes.maghrib}</div>
            </div>
            
            <div className="bg-amber-100/70 dark:bg-amber-800/50 rounded p-2 flex flex-col items-center justify-center">
              <div className="text-amber-800 dark:text-amber-200 text-xs uppercase font-medium">Isya</div>
              <div className="font-bold text-amber-900 dark:text-amber-100">{prayerTimes.isha}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerTimesWidget;
