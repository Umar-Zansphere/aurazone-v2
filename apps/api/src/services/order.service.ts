import { EmailService } from './email.service.js';
import { prisma, type Prisma } from "@aurazone/database";
import { generateOrderNumber } from "@aurazone/utils";
import crypto from "crypto";

export async function createOrderFromCart(
  userId: string,
  addressId: string,
  paymentMethod: "RAZORPAY" | "COD"
) {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, slug: true, storeId: true } },
              images: { take: 1, orderBy: { position: "asc" } },
              attributes: true,
              inventory: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw Object.assign(new Error("Cart is empty"), { statusCode: 400 });
  }

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw Object.assign(new Error("Address not found"), { statusCode: 404 });

  for (const item of cart.items) {
    const stock = item.variant.inventory?.quantity ?? 0;
    if (item.quantity > stock) {
      throw Object.assign(
        new Error(`Insufficient stock for "${item.variant.product.name}"`),
        { statusCode: 400 }
      );
    }
  }

  let totalAmount = 0;
  for (const item of cart.items) {
    totalAmount += item.unitPrice.toNumber() * item.quantity;
  }

  const orderNumber = generateOrderNumber();
  const trackingToken = crypto.randomBytes(16).toString("hex");

  const storeIds = [...new Set(cart.items.map((i) => i.variant.product.storeId))];

  const order = await prisma.$transaction(async (tx) => {
    const stores = await tx.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true },
    });
    const storeMap = Object.fromEntries(stores.map((s) => [s.id, s.name]));

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        trackingToken,
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod,
        totalAmount,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            productName: item.variant.product.name,
            productSlug: item.variant.product.slug,
            storeName: storeMap[item.variant.product.storeId] ?? "Unknown",
            imageUrl: item.variant.images[0]?.url ?? null,
            attributesSnapshot: item.variant.attributes.map((a) => ({
              key: a.key,
              value: a.value,
            })),
            price: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.unitPrice.toNumber() * item.quantity,
          })),
        },
        orderAddress: {
          create: {
            name: address.name,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 ?? null,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        },
      },
      include: { items: true },
    });

    // Decrement inventory
    for (const item of cart.items) {
      if (item.variant.inventory) {
        await tx.inventory.update({
          where: { id: item.variant.inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          orderId: newOrder.id,
          quantity: -item.quantity,
          type: "SOLD",
          note: `Order ${orderNumber}`,
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return newOrder;
  });

  return order;
}

export async function getUserOrders(userId: string, skip = 0, take = 10) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip, take,
      include: {
        items: true,
        orderAddress: true,
        payments: { take: 1, orderBy: { createdAt: "desc" } },
        shipments: { take: 1, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.order.count({ where: { userId, deletedAt: null } }),
  ]);
  return { orders, total };
}

export async function getOrderById(id: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { slug: true } },
              images: { take: 1, orderBy: { position: "asc" } },
            },
          },
        },
      },
      orderAddress: true,
      payments: true,
      shipments: true,
      orderLogs: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!order || order.deletedAt) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  if (userId && order.userId !== userId) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  return order;
}

export async function updateOrderStatus(id: string, status: string, adminId?: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
  if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });

  const updated = await prisma.order.update({ where: { id }, data: { status: status as any }, include: { user: true } });

  if (adminId) {
    await prisma.orderLog.create({
      data: {
        orderId: id,
        adminId,
        action: "STATUS_UPDATE",
        fromStatus: order.status,
        toStatus: status as any,
        note: `Status changed from ${order.status} to ${status}`,
      },
    });
  }

  return updated;
}

export async function cancelOrder(id: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.userId !== userId) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  if (!["PENDING", "RECEIVED"].includes(order.status)) {
    throw Object.assign(new Error("Order cannot be cancelled in its current status"), { statusCode: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });

    for (const item of order.items) {
      const inv = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
      if (inv) {
        await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: item.quantity } } });
      }
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          orderId: id,
          quantity: item.quantity,
          type: "RESTOCK",
          note: `Order ${order.orderNumber} cancelled`,
        },
      });
    }
  });
}