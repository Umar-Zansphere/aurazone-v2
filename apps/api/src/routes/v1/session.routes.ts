import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@aurazone/database";
import crypto from "crypto";
import { sendSuccess } from "../../middleware/response.js";

const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", async (_request, reply) => {
    const sessionId = crypto.randomBytes(32).toString("hex");

    const session = await prisma.guestSession.create({
      data: {
        sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    await prisma.cart.create({
      data: { sessionId: session.id },
    });

    return sendSuccess(reply, { sessionId: session.sessionId, guestId: session.id }, 201);
  });
};

export default sessionRoutes;