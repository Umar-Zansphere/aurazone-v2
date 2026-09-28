import fp from "fastify-plugin";
import { prisma } from "@aurazone/database";
import type { FastifyPluginAsync } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

const prismaPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
};

export const prismaPlugin = fp(prismaPluginImpl, { name: "prisma" });
