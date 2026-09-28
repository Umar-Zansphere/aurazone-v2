import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sendError } from "./response.js";
import type { Role } from "@aurazone/database";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Extract and verify JWT from cookies or Authorization header.
 * Attaches `request.user` on success.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token =
    request.cookies?.access_token ??
    request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return sendError(reply, "Authentication required", 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    request.user = payload;
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError
        ? "Token expired"
        : "Invalid token";
    return sendError(reply, message, 401);
  }
}

/**
 * Factory: require one of the given roles.
 * Must be used AFTER `authenticate`.
 */
export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return sendError(reply, "Authentication required", 401);
    }
    if (!roles.includes(request.user.role)) {
      return sendError(reply, "Insufficient permissions", 403);
    }
  };
}

/**
 * Optional auth — attaches user if token present, but doesn't block.
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const token =
    request.cookies?.access_token ??
    request.headers.authorization?.replace("Bearer ", "");

  if (!token) return;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    request.user = payload;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
}

/**
 * Generate access + refresh tokens for a user.
 */
export function generateTokens(payload: Omit<JwtPayload, "iat" | "exp">) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: 900, // 15 minutes
  });

  const refreshToken = jwt.sign(
    { ...payload, type: "refresh" },
    env.JWT_SECRET,
    { expiresIn: 604800 } // 7 days
  );

  return { accessToken, refreshToken };
}

/**
 * Set auth cookies on a reply.
 */
export function setAuthCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string
): void {
  reply.setCookie("access_token", accessToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    domain: env.COOKIE_DOMAIN,
    maxAge: 15 * 60, // 15 minutes
  });

  reply.setCookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/v1/auth/refresh",
    domain: env.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear auth cookies.
 */
export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie("access_token", { path: "/" });
  reply.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" });
}