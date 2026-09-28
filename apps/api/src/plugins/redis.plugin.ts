import fp from "fastify-plugin";
import { Redis } from "ioredis";
import type { FastifyPluginAsync } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis | null;
  }
}

const redisPluginImpl: FastifyPluginAsync = async (fastify) => {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      // Stop retrying after 3 attempts in dev to avoid log spam
      if (process.env.NODE_ENV === "development" && times > 3) return null;
      return Math.min(times * 500, 5000);
    },
  });

  redis.on("error", (err) => {
    // Log once, not on every retry
    if (!("_warnedRedis" in fastify)) {
      (fastify as unknown as Record<string, unknown>)._warnedRedis = true;
      fastify.log.warn({ err: err.message }, "Redis unavailable — caching disabled");
    }
  });

  try {
    await redis.connect();
    fastify.log.info("Redis connected");
  } catch {
    fastify.log.warn("Redis connection skipped — running without cache");
  }

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async () => {
    redis.disconnect();
  });
};

export const redisPlugin = fp(redisPluginImpl, { name: "redis" });