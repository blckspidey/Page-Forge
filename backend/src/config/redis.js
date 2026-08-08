import Redis from 'ioredis';

let redisClient = null;

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[Redis] REDIS_URL not configured. Running without Redis cache.');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Keep null to allow retryStrategy to handle it
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[Redis] Max connection attempts (3) reached. Redis will remain offline.');
          return null; // Stops reconnecting
        }
        const delay = Math.min(times * 1000, 3000);
        console.log(`[Redis] Connection attempt ${times} failed. Retrying in ${delay}ms...`);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully.');
    });

    redisClient.on('error', (err) => {
      // Suppress spamming after connection stops retrying
      if (redisClient && redisClient.status !== 'end') {
        console.error('[Redis] Connection error:', err.message);
      }
    });

    return redisClient;
  } catch (err) {
    console.error('[Redis] Failed to initialize client:', err);
    return null;
  }
};

export const getRedisClient = () => {
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }
  return null;
};
