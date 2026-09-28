import type { FastifyPluginAsync } from "fastify";
import { addressSchema } from "@aurazone/validators";
import { prisma } from "@aurazone/database";
import { authenticate } from "../../middleware/auth.js";
import { sendSuccess, sendError } from "../../middleware/response.js";

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/profile", async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.userId },
      select: {
        id: true, email: true, phone: true, fullName: true,
        avatar: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    if (!user) return sendError(reply, "User not found", 404);
    return sendSuccess(reply, user);
  });

  fastify.put("/profile", async (request, reply) => {
    const body = request.body as { fullName?: string; avatar?: string };
    const user = await prisma.user.update({
      where: { id: request.user!.userId },
      data: {
        ...(body.fullName !== undefined && { fullName: body.fullName }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
      },
      select: { id: true, email: true, fullName: true, avatar: true, role: true },
    });
    return sendSuccess(reply, user);
  });

  fastify.get("/addresses", async (request, reply) => {
    const addresses = await prisma.address.findMany({
      where: { userId: request.user!.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return sendSuccess(reply, addresses);
  });

  fastify.post("/addresses", async (request, reply) => {
    const parsed = addressSchema.safeParse(request.body);
    if (!parsed.success) return sendError(reply, parsed.error.errors[0].message, 400);

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: request.user!.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { userId: request.user!.userId, ...parsed.data },
    });
    return sendSuccess(reply, address, 201);
  });

  fastify.put("/addresses/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = addressSchema.partial().safeParse(request.body);
    if (!parsed.success) return sendError(reply, parsed.error.errors[0].message, 400);

    const address = await prisma.address.findFirst({ where: { id, userId: request.user!.userId } });
    if (!address) return sendError(reply, "Address not found", 404);

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: request.user!.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({ where: { id }, data: parsed.data });
    return sendSuccess(reply, updated);
  });

  fastify.delete("/addresses/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const address = await prisma.address.findFirst({ where: { id, userId: request.user!.userId } });
    if (!address) return sendError(reply, "Address not found", 404);
    await prisma.address.delete({ where: { id } });
    return sendSuccess(reply, { message: "Address deleted" });
  });
};

export default userRoutes;