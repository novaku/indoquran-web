'use client';

import React, { useState, useEffect } from 'react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  duration?: number; // Auto-dismiss duration in milliseconds (if not provided, won't auto-dismiss)
}

const ErrorAlert = ({ message, onDismiss, duration }: ErrorAlertProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div 
      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 animate-fadeIn"
      role="alert"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          className="absolute top-0 right-0 p-2 text-red-500 hover:text-red-700"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
        >
          <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
