// Types for the Prayer system
export interface Prayer {
  id: number;
  authorName: string;
  content: string;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  amiinCount?: number;
  commentCount?: number;
  currentUserSaidAmiin?: boolean;
}

export interface PrayerResponse {
  id: number;
  prayerId: number;
  authorName: string;
  userId: number | null;
  content: string;
  responseType: 'amiin' | 'comment';
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  replies?: PrayerResponse[];
}

export interface PrayerStats {
  prayerId: number;
  amiinCount: number;
  commentCount: number;
  lastActivityAt: string;
}

export interface CreatePrayerRequest {
  authorName: string;
  content: string;
}

export interface CreatePrayerResponseRequest {
  prayerId: number;
  authorName: string;
  content: string;
  responseType: 'amiin' | 'comment';
  parentId?: number | null;
}

export interface PrayerPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'most_amiin' | 'most_comments' | 'recent_activity';
}

export interface PaginatedPrayerResponse {
  success: boolean;
  prayers: Prayer[];
  totalPrayers: number;
  totalPages: number;
  currentPage: number;
}
