import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import quranClient from '@/services/quranClient';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const SURAH_CACHE_KEY = 'surahs:data';
const SURAH_CACHE_TIMESTAMP_KEY = 'surahs:timestamp';
const CACHE_TTL_SECONDS = 60 * 60 * 6; // 6 hours

export async function GET(req: NextRequest) {
  // Optionally support force refresh via query param
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get('refresh') === '1';

  // Check cache timestamp for staleness
  const cachedTimestamp = await redis.get(SURAH_CACHE_TIMESTAMP_KEY);
  let isStale = false;
  if (cachedTimestamp) {
    const now = Date.now();
    const age = now - parseInt(cachedTimestamp, 10);
    // If older than TTL, mark as stale
    if (age > CACHE_TTL_SECONDS * 1000) {
      isStale = true;
    }
  } else {
    isStale = true;
  }

  let surahs = null;
  if (!forceRefresh && !isStale) {
    const cached = await redis.get(SURAH_CACHE_KEY);
    if (cached) {
      surahs = JSON.parse(cached);
    }
  }

  if (!surahs || forceRefresh || isStale) {
    // Fetch fresh data
    surahs = await quranClient.getAllSurah();
    // Update cache
    await redis.set(SURAH_CACHE_KEY, JSON.stringify(surahs), 'EX', CACHE_TTL_SECONDS);
    await redis.set(SURAH_CACHE_TIMESTAMP_KEY, Date.now().toString(), 'EX', CACHE_TTL_SECONDS);
  }

  return NextResponse.json({ surahs, cached: !forceRefresh && !isStale });
}
