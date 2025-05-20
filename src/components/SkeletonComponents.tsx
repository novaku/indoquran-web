'use client';

import React from 'react';

/**
 * AyatCardSkeleton - Loading placeholder for Ayat cards
 */
export const AyatCardSkeleton = () => {
  return (
    <div className="mb-8 p-6 border border-amber-200 rounded-lg bg-amber-50/30 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-amber-200 rounded-full"></div>
      </div>
      
      <div className="space-y-4">
        <div className="h-12 w-full bg-amber-200 rounded"></div>
        <div className="h-6 w-3/4 bg-amber-200 rounded"></div>
        <div className="h-4 w-full bg-amber-200 rounded"></div>
      </div>
    </div>
  );
};

/**
 * SurahCardSkeleton - Loading placeholder for Surah cards
 */
export const SurahCardSkeleton = () => {
  return (
    <div className="p-4 border border-amber-200 rounded-lg animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-200 rounded-full"></div>
          <div>
            <div className="h-6 w-32 bg-amber-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-amber-200 rounded"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-8 w-16 bg-amber-200 rounded mb-2"></div>
          <div className="h-4 w-20 bg-amber-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * BookmarkSkeleton - Loading placeholder for bookmarks section
 */
export function BookmarkSkeleton({ count = 3, groupsCount = 2 }) {
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
          </div>

          {/* Ayat List Skeleton */}
          <div>
            {Array.from({ length: groupSize }).map((_, itemIndex) => (
              <div key={`item-${groupIndex}-${itemIndex}`} className="p-4 border-b border-amber-100 last:border-0">
                <div className="flex justify-between">
                  <div>
                    <div className="h-5 bg-amber-100 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-amber-50 rounded w-20"></div>
                  </div>
                  <div className="h-8 w-16 bg-amber-50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * FavoriteSkeleton - Loading placeholder for favorites section
 */
export function FavoriteSkeleton({ count = 3, groupsCount = 2 }) {
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
          </div>

          {/* Favorite Ayat List Skeleton */}
          <div>
            {Array.from({ length: groupSize }).map((_, itemIndex) => (
              <div key={`item-${groupIndex}-${itemIndex}`} className="p-4 border-b border-amber-100 last:border-0">
                <div>
                  <div className="h-5 bg-amber-100 rounded w-40 mb-2"></div>
                  <div className="h-3 bg-amber-50 rounded w-full mb-1"></div>
                  <div className="h-3 bg-amber-50 rounded w-1/2 mb-3"></div>
                  <div className="flex justify-end">
                    <div className="h-8 w-24 bg-amber-50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ReadingHistorySkeleton - Loading placeholder for reading history
 */
export function ReadingHistorySkeleton() {
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

/**
 * NoteSkeleton - Loading placeholder for notes section
 */
export function NoteSkeleton({ count = 3, groupsCount = 2 }) {
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
        <div key={`group-${groupIndex}`} className="bg-white rounded-lg border border-green-200 overflow-hidden">
          {/* Surah Header Skeleton */}
          <div className="bg-green-50 p-4 border-b border-green-200">
            <div className="h-6 bg-green-100 rounded w-1/3 mb-2"></div>
          </div>

          {/* Notes List Skeleton */}
          <div>
            {Array.from({ length: groupSize }).map((_, itemIndex) => (
              <div key={`item-${groupIndex}-${itemIndex}`} className="p-4 border-b border-green-100 last:border-0">
                <div>
                  <div className="h-5 bg-green-100 rounded w-40 mb-2"></div>
                  <div className="h-16 bg-green-50 rounded w-full mb-2"></div>
                  <div className="h-3 bg-green-50 rounded w-1/4 mt-2"></div>
                  <div className="flex justify-end mt-2">
                    <div className="h-8 w-24 bg-green-50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SearchHistorySkeleton - Loading placeholder for search history section
 */
export function SearchHistorySkeleton() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-32 bg-amber-200 rounded"></div>
        <div className="h-6 w-24 bg-amber-200 rounded"></div>
      </div>
      <div className="space-y-2 animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-amber-200 rounded mb-2"></div>
              <div className="flex">
                <div className="h-4 w-16 bg-amber-200 rounded mr-4"></div>
                <div className="h-4 w-20 bg-amber-200 rounded mr-4"></div>
                <div className="h-4 w-32 bg-amber-200 rounded"></div>
              </div>
            </div>
            <div className="h-6 w-6 bg-amber-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default {
  AyatCardSkeleton,
  SurahCardSkeleton,
  BookmarkSkeleton,
  FavoriteSkeleton,
  ReadingHistorySkeleton,
  NoteSkeleton,
  SearchHistorySkeleton
};
