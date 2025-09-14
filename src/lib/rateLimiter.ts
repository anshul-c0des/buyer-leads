type RateLimitEntry = {
    count: number
    lastReset: number
  }
  
  const userRateMap = new Map<string, RateLimitEntry>()
  
  /**
   * @param key Unique key (user ID or IP)
   * @param limit Max number of requests allowed
   * @param windowMs Time window in ms
   */
  export function checkRateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now()
    const entry = userRateMap.get(key)
  
    if (!entry) {
      userRateMap.set(key, { count: 1, lastReset: now })
      return { allowed: true }
    }
  
    const timeElapsed = now - entry.lastReset
  
    if (timeElapsed > windowMs) {
      userRateMap.set(key, { count: 1, lastReset: now })
      return { allowed: true }
    }
  
    if (entry.count >= limit) {
      return {
        allowed: false,
        retryAfter: Math.ceil((windowMs - timeElapsed) / 1000), // in seconds
      }
    }
  
    entry.count++
    return { allowed: true }
  }
  