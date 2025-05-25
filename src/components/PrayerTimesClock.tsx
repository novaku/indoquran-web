'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PrayerTimesClock = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    // Set up clock
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-amber-900 font-medium text-sm">
      {format(currentDate, 'HH:mm:ss', { locale: id })}
    </div>
  );
};

export default PrayerTimesClock;
