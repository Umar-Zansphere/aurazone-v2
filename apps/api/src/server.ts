import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import { prismaPlugin } from "./plugins/prisma.plugin.js";
import { redisPlugin } from "./plugins/redis.plugin.js";
import { v1Routes } from "./routes/v1/index.js";
import { globalErrorHandler } from "./middleware/response.js";
import { env } from "./config/env.js";

const buildServer = async () => {
  const app = Fastify({
    logger: {
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // ─── Global Error Handler ─────────────────────────────────────
  app.setErrorHandler(globalErrorHandler);

  // ─── Plugins ──────────────────────────────────────────────────
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      const allowed = [
        env.CUSTOMER_URL,
        env.ADMIN_URL,
      ].filter(Boolean);
      if (!origin || allowed.includes(origin) || origin.endsWith(".aurazone.com")) {
        cb(null, true);
      } else {
        cb(new Error("CORS: origin not allowed"), false);
      }
    },
    credentials: true,
  });

  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
  });

  await app.register(fastifyRateLimit, {
    max: 200,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      success: false,
      message: "Rate limit exceeded. Please slow down.",
      error: "Too Many Requests",
    }),
  });

  await app.register(prismaPlugin);
  await app.register(redisPlugin);

  // ─── Routes ───────────────────────────────────────────────────
  await app.register(v1Routes, { prefix: "/api/v1" });

  // ─── Health ───────────────────────────────────────────────────
  app.get("/health", async () => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return { success: true, status: "healthy", db: "ok", timestamp: new Date().toISOString() };
    } catch {
      return { success: false, status: "unhealthy", db: "error" };
    }
  });

  app.get("/", async () => ({
    success: true,
    message: "AuraZone V2 API",
    version: "1.0.0",
  }));

  return app;
};

export { buildServer };