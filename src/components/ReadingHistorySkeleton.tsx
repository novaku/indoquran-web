'use client';

import React from 'react';

export default function ReadingHistorySkeleton() {
  return (
    <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm w-full mb-6 animate-pulse">
      <div className="h-6 bg-amber-100 rounded w-1/3 mb-4"></div>
      <div className="space-y-4">
        <div className="h-5 bg-amber-50 rounded w-3/4"></div>
        <div className="h-5 bg-amber-50 rounded w-2/4"></div>
        <div className="h-4 bg-amber-50 rounded w-1/3 mb-4"></div>
        
        <div className="pt-4 mt-4 border-t border-amber-100">
          <div className="flex gap-2">
            <div className="h-10 bg-amber-300 rounded w-32"></div>
            <div className="h-10 bg-amber-100 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
