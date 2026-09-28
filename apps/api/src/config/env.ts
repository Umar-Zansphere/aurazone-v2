import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  HOST: process.env.HOST ?? "0.0.0.0",

  // Database
  DATABASE_URL: process.env.DATABASE_URL ?? "",

  // Redis
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-jwt-secret-change-in-production",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? "7d",

  // Cookies
  COOKIE_SECRET: process.env.COOKIE_SECRET ?? "dev-cookie-secret-change-in-production",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "localhost",
  COOKIE_SECURE: process.env.NODE_ENV === "production",

  // S3
  S3_BUCKET: process.env.S3_BUCKET ?? "",
  S3_REGION: process.env.S3_REGION ?? "ap-south-1",
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? "",
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? "",

  // Email (SMTP)
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "noreply@aurazone.com",

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? "",

  // Frontend URLs (for CORS, emails)
  CUSTOMER_URL: process.env.CUSTOMER_URL ?? "http://localhost:3000",
  ADMIN_URL: process.env.ADMIN_URL ?? "http://localhost:3001",
} as const;

export type Env = typeof env;