import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';

/**
 * Creates an Express rate limiter middleware.
 * If Redis is active, it uses rate-limit-redis to synchronize requests across clusters/servers.
 * If Redis is not active, it falls back to express-rate-limit's built-in memory store.
 * 
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} maxRequests - Max requests allowed per window (default: 100)
 * @returns {Function} Express middleware function
 */
export const createApiRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const redis = getRedisClient();

  const storeOptions = redis
    ? {
        sendCommand: (...args) => redis.call(...args),
      }
    : undefined;

  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      error: 'Too many requests from this client. Please try again later.',
    },
    store: storeOptions ? new RedisStore(storeOptions) : undefined,
  });
};
