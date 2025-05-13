'use server';

import { NextResponse } from 'next/server';
import { Surah } from '@/types/quran';
import { getCache } from '@/utils/redis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ 
      success: false,
      error: 'Query parameter is required' 
    }, { status: 400 });
  }
  
  try {
    // Get all Surahs from Redis cache
    const cacheKey = 'quran:allSurah';
    const allSurahs = await getCache<Surah[]>(cacheKey);
    
    if (!allSurahs) {
      return NextResponse.json({ 
        success: false, 
        error: 'Surah data not found in cache' 
      }, { status: 404 });
    }
    
    // Search for matching surahs by name (case insensitive)
    const normalizedQuery = query.toLowerCase();
    const results = allSurahs.filter(surah => 
      surah.namaLatin.toLowerCase().includes(normalizedQuery) || 
      surah.nama.includes(normalizedQuery) || 
      surah.arti.toLowerCase().includes(normalizedQuery)
    );
    
    // Limit to top 5 matches for autocomplete
    const limitedResults = results.slice(0, 5);
    
    return NextResponse.json({
      success: true,
      data: limitedResults
    });
    
  } catch (error) {
    console.error('Error searching surahs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search surahs' 
    }, { status: 500 });
  }
}
