import type { FastifyPluginAsync } from "fastify";
import { addToCartSchema, updateCartItemSchema } from "@aurazone/validators";
import { prisma } from "@aurazone/database";
import { authenticate } from "../../middleware/auth.js";
import { sendSuccess, sendError } from "../../middleware/response.js";

const cartRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", async (request, reply) => {
    let cart = await prisma.cart.findFirst({
      where: { userId: request.user!.userId, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true, name: true, slug: true,
                    store: { select: { id: true, name: true, slug: true } },
                  },
                },
                images: { take: 1, orderBy: { position: "asc" } },
                attributes: true,
                inventory: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: request.user!.userId },
        include: { items: { include: { variant: true } } },
      }) as unknown as typeof cart;
    }

    if (!cart) {
      return sendSuccess(reply, { items: [], itemCount: 0, subtotal: 0 });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice.toNumber() * item.quantity,
      0
    );

    return sendSuccess(reply, {
      ...cart!,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    });
  });

  fastify.post("/", async (request, reply) => {
    const parsed = addToCartSchema.safeParse(request.body);
    if (!parsed.success) return sendError(reply, parsed.error.errors[0].message, 400);

    const variant = await prisma.productVariant.findUnique({
      where: { id: parsed.data.variantId },
      include: { product: { select: { id: true, isActive: true } }, inventory: true },
    });

    if (!variant || !variant.isAvailable || !variant.product.isActive) {
      return sendError(reply, "Product variant not available", 400);
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: request.user!.userId, status: "ACTIVE" },
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: request.user!.userId } });
    }

    const stock = variant.inventory?.quantity ?? 0;
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId: parsed.data.variantId },
    });

    if (existing) {
      const newQty = existing.quantity + (parsed.data.quantity ?? 1);
      if (newQty > stock) return sendError(reply, `Only ${stock} available in stock`, 400);
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    } else {
      const qty = parsed.data.quantity ?? 1;
      if (qty > stock) return sendError(reply, `Only ${stock} available in stock`, 400);
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: variant.product.id,
          variantId: parsed.data.variantId,
          quantity: qty,
          unitPrice: variant.price,
        },
      });
    }

    return sendSuccess(reply, { message: "Item added to cart" }, 201);
  });

  fastify.patch("/:itemId", async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const parsed = updateCartItemSchema.safeParse(request.body);
    if (!parsed.success) return sendError(reply, parsed.error.errors[0].message, 400);

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, variant: { include: { inventory: true } } },
    });

    if (!item || item.cart.userId !== request.user!.userId) {
      return sendError(reply, "Cart item not found", 404);
    }

    const stock = item.variant.inventory?.quantity ?? 0;
    if (parsed.data.quantity > stock) {
      return sendError(reply, `Only ${stock} available in stock`, 400);
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parsed.data.quantity },
    });
    return sendSuccess(reply, updated);
  });

  fastify.delete("/:itemId", async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId }, include: { cart: true },
    });
    if (!item || item.cart.userId !== request.user!.userId) {
      return sendError(reply, "Cart item not found", 404);
    }
    await prisma.cartItem.delete({ where: { id: itemId } });
    return sendSuccess(reply, { message: "Item removed from cart" });
  });

  fastify.delete("/", async (request, reply) => {
    const cart = await prisma.cart.findFirst({
      where: { userId: request.user!.userId, status: "ACTIVE" },
    });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return sendSuccess(reply, { message: "Cart cleared" });
  });
};

export default cartRoutes;