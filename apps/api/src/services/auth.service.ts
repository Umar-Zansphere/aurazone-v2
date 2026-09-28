import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma, type User } from "@aurazone/database";
import { generateTokens } from "../middleware/auth.js";

const SALT_ROUNDS = 12;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function signupWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, fullName: fullName ?? null, role: "CUSTOMER" },
  });

  await prisma.cart.create({ data: { userId: user.id } });
  await prisma.wishlist.create({ data: { userId: user.id } });

  const tokens = generateTokens({ userId: user.id, email: user.email!, role: user.role });

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(tokens.refreshToken),
      deviceInfo: "web",
      ipAddress: "0.0.0.0",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, ...tokens };
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  const tokens = generateTokens({ userId: user.id, email: user.email!, role: user.role });

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(tokens.refreshToken),
      deviceInfo: "web",
      ipAddress: "0.0.0.0",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, ...tokens };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, phone: true, fullName: true,
      avatar: true, role: true, createdAt: true,
    },
  });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
}

export async function refreshAccessToken(refreshToken: string) {
  const hash = hashToken(refreshToken);
  const session = await prisma.userSession.findFirst({
    where: { refreshTokenHash: hash, expiresAt: { gt: new Date() } },
  });

  if (!session) {
    throw Object.assign(new Error("Invalid or expired refresh token"), { statusCode: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 401 });

  const tokens = generateTokens({ userId: user.id, email: user.email!, role: user.role });

  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  const hash = hashToken(refreshToken);
  await prisma.userSession.deleteMany({ where: { refreshTokenHash: hash } });
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return "";
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashToken(token),
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const hashedToken = hashToken(token);
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: hashedToken, passwordResetExpires: { gt: new Date() } },
  });
  if (!user) throw Object.assign(new Error("Invalid or expired reset token"), { statusCode: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, SALT_ROUNDS),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  await prisma.userSession.deleteMany({ where: { userId: user.id } });
}