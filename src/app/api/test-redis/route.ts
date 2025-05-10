import { setCache, getCache } from '../../../utils/redis';

// This API route is for testing Redis connection
export async function GET() {
  try {
    // Test basic Redis functionality via setCache/getCache functions
    const testKey = 'test_key';
    const testValue = 'Redis is working!';
    
    await setCache(testKey, testValue);
    const value = await getCache<string>(testKey);
    
    if (value === 'Redis is working!') {
      return Response.json({ 
        success: true, 
        message: 'Redis connection is working properly',
        value
      });
    } else {
      return Response.json({ 
        success: false, 
        message: 'Redis set/get operations failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Redis test error:', error);
    return Response.json({ 
      success: false, 
      message: 'Redis connection test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
