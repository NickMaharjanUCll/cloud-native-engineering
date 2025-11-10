import { Auth } from '../types';

// Helper function to safely use the cache with proper logging and caching indicators
export async function safelyUseCache<T>(
  cacheInstance: any,
  cacheKey: string, 
  fetchDataFunction: () => Promise<T>,
  expirationSeconds = 600
): Promise<{ data: T, cacheInfo: { fromCache: boolean, key: string } }> {
  const startTime = Date.now();
  console.log(`🔍 [Cache] Attempting to retrieve from cache: ${cacheKey}`);
  
  try {
    // Try to get from cache
    try {
      const cachedData = await cacheInstance.getLinkMapping(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const elapsedMs = Date.now() - startTime;
        console.log(`🎯 [Cache] HIT: Found data in cache for key: ${cacheKey} (${elapsedMs}ms)`);
        return { 
          data: parsedData, 
          cacheInfo: { fromCache: true, key: cacheKey } 
        };
      }
      console.log(`⚠️ [Cache] MISS: No data found in cache for key: ${cacheKey}`);
    } catch (cacheError) {
      console.error(`❌ [Cache] Error reading from cache (key: ${cacheKey}):`, cacheError);
    }
    
    // Get from database
    console.log(`📊 [Cache] Fetching data from database for key: ${cacheKey}`);
    const dbStartTime = Date.now();
    const data = await fetchDataFunction();
    const dbElapsedMs = Date.now() - dbStartTime;
    console.log(`📊 [Cache] Database fetch completed in ${dbElapsedMs}ms`);
    
    // Try to store in cache
    try {
      await cacheInstance.setLinkMapping(cacheKey, JSON.stringify(data), expirationSeconds);
      console.log(`💾 [Cache] Successfully cached data for key: ${cacheKey} (TTL: ${expirationSeconds}s)`);
    } catch (cacheError) {
      console.error(`❌ [Cache] Error writing to cache (key: ${cacheKey}):`, cacheError);
    }
    
    const totalElapsedMs = Date.now() - startTime;
    console.log(`⏱️ [Cache] Total operation time: ${totalElapsedMs}ms`);
    return { 
      data, 
      cacheInfo: { fromCache: false, key: cacheKey } 
    };
  } catch (error) {
    console.error(`❌ [Cache] Wrapper function error:`, error);
    // Last resort fallback - just get the data directly
    const data = await fetchDataFunction();
    return { 
      data, 
      cacheInfo: { fromCache: false, key: cacheKey } 
    };
  }
}

// Helper to generate consistent cache keys
export const getCacheKey = {
  products: {
    all: (auth: Auth) => `cache:products:all:${auth?.username || 'anonymous'}`,
    byName: (name: string) => `cache:products:name:${name}`,
    search: (term: string) => `cache:products:search:${term || '*'}`
  },
  cart: {
    get: (auth: Auth) => `cache:cart:get:${auth.username}`,
    totalPrice: (auth: Auth) => `cache:cart:totalPrice:${auth.username}`,
    item: (auth: Auth, productName: string) => `cache:cart:item:${auth.username}:${productName}`
  },
  customer: {
    profile: (username: string) => `cache:customer:${username}`
  },
  order: {
    all: (auth: Auth) => `cache:orders:get:${auth.username}`,
    specific: (auth: Auth, orderId: string) => `cache:order:${auth.username}:${orderId}`
  }
};

// Helper to invalidate multiple cache keys at once
export async function invalidateCacheKeys(cacheInstance: any, keys: string[]) {
  console.log(`🗑️ [Cache] Invalidating ${keys.length} cache keys`);
  for (const key of keys) {
    try {
      await cacheInstance.setLinkMapping(key, JSON.stringify(null), 1);
      console.log(`🗑️ [Cache] Invalidated: ${key}`);
    } catch (error) {
      console.error(`❌ [Cache] Failed to invalidate key ${key}:`, error);
    }
  }
}