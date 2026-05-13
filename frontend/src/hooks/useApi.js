/**
 * src/hooks/useApi.js
 * Browser-side request caching using the Cache API.
 * Provides a stale-while-revalidate strategy.
 */

export async function cachedFetch(url, options = {}) {
  // Use 'policyforge-api' as the cache name
  const cacheName = 'policyforge-api-v1';
  
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      // Revalidate in background
      fetch(url, options).then(async (freshResponse) => {
        if (freshResponse.ok) {
          await cache.put(url, freshResponse.clone());
        }
      }).catch(err => console.warn('Background revalidation failed:', err));

      // Return the cached data immediately
      return await cachedResponse.json();
    }
  } catch (e) {
    console.warn('Cache API not available or failed:', e);
  }

  // If no cache or error, fetch normally
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Try to store in cache for next time
  try {
    const cache = await caches.open(cacheName);
    const clonedResponse = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, clonedResponse);
  } catch (e) {
    // Ignore cache storage errors
  }

  return data;
}
