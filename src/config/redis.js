const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  // Check if Redis is enabled
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('Redis is disabled - running without cache');
    return null;
  }

  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on('error', (err) => {
      console.log('Redis Client Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.log('Redis connection failed - running without cache:', error.message);
    return null;
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log('Cache get error:', error);
    return null;
  }
};

const setCache = async (key, data, ttl = 300) => {
  if (!redisClient) return;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.log('Cache set error:', error);
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.log('Cache delete error:', error);
  }
};

const clearCachePattern = async (pattern) => {
  if (!redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.log('Cache clear pattern error:', error);
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern
};
