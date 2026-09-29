import type { FastifyPluginAsync } from "fastify";
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@aurazone/validators";
import { authenticate, setAuthCookies, clearAuthCookies } from "../../middleware/auth.js";
import { sendSuccess, sendError } from "../../middleware/response.js";
import * as authService from "../../services/auth.service.js";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── POST /signup ─────────────────────────────────────────────
  fastify.post("/signup", async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, parsed.error.errors[0].message, 400);
    }

    try {
      const guestSession = request.headers["x-guest-session"] as string | undefined;

      const { user, accessToken, refreshToken } = await authService.signupWithEmail(
        parsed.data.email,
        parsed.data.password,
        parsed.data.fullName,
        guestSession
      );

      setAuthCookies(reply, accessToken, refreshToken);

      return sendSuccess(reply, {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken,
      }, 201);
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });

  // ─── POST /login ──────────────────────────────────────────────
  fastify.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, parsed.error.errors[0].message, 400);
    }

    try {
      const guestSession = request.headers["x-guest-session"] as string | undefined;

      const { user, accessToken, refreshToken } = await authService.loginWithEmail(
        parsed.data.email,
        parsed.data.password,
        guestSession
      );

      setAuthCookies(reply, accessToken, refreshToken);

      return sendSuccess(reply, {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken,
      });
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });

  // ─── GET /me ──────────────────────────────────────────────────
  fastify.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const user = await authService.getCurrentUser(request.user!.userId);
      return sendSuccess(reply, { user });
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });

  // ─── POST /refresh ────────────────────────────────────────────
  fastify.post("/refresh", async (request, reply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      return sendError(reply, "Refresh token required", 401);
    }

    try {
      const tokens = await authService.refreshAccessToken(refreshToken);
      setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
      return sendSuccess(reply, { accessToken: tokens.accessToken });
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      clearAuthCookies(reply);
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });

  // ─── POST /logout ─────────────────────────────────────────────
  fastify.post("/logout", async (request, reply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearAuthCookies(reply);
    return sendSuccess(reply, { message: "Logged out" });
  });

  // ─── POST /forgot-password ────────────────────────────────────
  fastify.post("/forgot-password", async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, parsed.error.errors[0].message, 400);
    }

    const token = await authService.createPasswordResetToken(parsed.data.email);

    // TODO: Send email with reset link via BullMQ job
    if (token && process.env.NODE_ENV === "development") {
      fastify.log.info(`Password reset token for ${parsed.data.email}: ${token}`);
    }

    // Always return success (don't reveal if email exists)
    return sendSuccess(reply, {
      message: "If an account exists with this email, a reset link has been sent.",
    });
  });

  // ─── POST /reset-password ────────────────────────────────────
  fastify.post("/reset-password", async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, parsed.error.errors[0].message, 400);
    }

    try {
      await authService.resetPassword(parsed.data.token, parsed.data.password);
      return sendSuccess(reply, { message: "Password reset successfully" });
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });
};

export default authRoutes;