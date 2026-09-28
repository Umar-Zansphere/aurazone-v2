import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@aurazone/database";
import { sendSuccess, sendError } from "../../middleware/response.js";

const storefrontRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── GET / — Get all active storefront sections ───────────────
  fastify.get("/", async (_request, reply) => {
    const sections = await prisma.storefrontSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return sendSuccess(reply, sections);
  });

  // ─── GET /:id — Get single section ────────────────────────────
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const section = await prisma.storefrontSection.findUnique({
      where: { id },
    });

    if (!section) {
      return sendError(reply, "Section not found", 404);
    }

    return sendSuccess(reply, section);
  });
};

export default storefrontRoutes;