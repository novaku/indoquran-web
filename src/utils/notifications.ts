'use client';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if (!('Notification' in window)) {
    return;
  }
  
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};

export const schedulePrayerNotification = (
  prayerName: string,
  scheduledTime: Date,
  notifyMinutesBefore: number = 10
): number => {
  // Calculate notification time (minutes before prayer time)
  const notificationTime = new Date(scheduledTime.getTime() - notifyMinutesBefore * 60 * 1000);
  const now = new Date();
  
  // If the notification time is in the past, don't schedule it
  if (notificationTime < now) {
    return -1;
  }
  
  // Calculate milliseconds until notification should be triggered
  const timeoutMs = notificationTime.getTime() - now.getTime();
  
  // Schedule notification
  const timerId = window.setTimeout(() => {
    showNotification(`Waktu Sholat ${prayerName}`, {
      body: `Waktu sholat ${prayerName} akan tiba dalam ${notifyMinutesBefore} menit`,
      icon: '/icons/icon-192x192.png',
    });
  }, timeoutMs);
  
  return timerId;
};
