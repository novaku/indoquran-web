'use client';

import React from 'react';

export default function FavoriteSkeleton({ count = 3, groupsCount = 2 }) {
  // Create array of group sizes to simulate surah groups
  const groupSizes = Array.from({ length: Math.min(groupsCount, count) }).map((_, i) => {
    // Last group gets remainder items
    if (i === groupsCount - 1) {
      return Math.max(1, count - Math.floor(count / groupsCount) * (groupsCount - 1));
    }
    return Math.max(1, Math.floor(count / groupsCount));
  });

  return (
    <div className="grid gap-6 animate-pulse">
      {groupSizes.map((groupSize, groupIndex) => (
        <div key={`group-${groupIndex}`} className="bg-white rounded-lg border border-amber-200 overflow-hidden">
          {/* Surah Header Skeleton */}
          <div className="bg-amber-50 p-4 border-b border-amber-200">
            <div className="h-6 bg-amber-100 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-amber-50 rounded w-2/3"></div>
          </div>
          
          {/* Ayat List Skeleton */}
          <div className="divide-y divide-amber-100">
            {Array.from({ length: groupSize }).map((_, i) => (
              <div key={`item-${groupIndex}-${i}`} className="p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-amber-100 rounded-full w-8 h-8 mr-3"></div>
                  <div className="h-4 bg-amber-50 rounded w-24"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-amber-100 rounded"></div>
                  <div className="w-6 h-6 bg-amber-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
