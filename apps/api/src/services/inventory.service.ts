import { prisma, type InventoryLogType } from "@aurazone/database";

const RESERVATION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours — matches cart reaper window

/**
 * Hold inventory for a cart item.
 * Creates an InventoryReservation record keyed to the cartItemId and increments
 * the scalar `reserved` counter.  If a reservation already exists for this cart
 * item it is extended (upsert) so the operation is idempotent.
 */
export async function holdInventory(
  variantId: string,
  quantity: string | number,
  cartItemId: string,
  note?: string
) {
  const qty = Number(quantity);
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

  return prisma.$transaction(async (tx) => {
    // Try to find an existing reservation for this cart item
    const existing = await tx.inventoryReservation.findUnique({
      where: { cartItemId },
    });

    if (existing) {
      // Extending an existing reservation (item qty increased)
      const delta = qty; // qty is the *additional* amount to hold
      const updated = await tx.$executeRaw`
        UPDATE "Inventory"
        SET reserved = reserved + ${delta}
        WHERE variant_id = ${variantId} AND quantity - reserved >= ${delta}
      `;
      if (updated === 0) {
        throw Object.assign(new Error("Insufficient stock available for hold"), { statusCode: 400 });
      }
      await tx.inventoryReservation.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + delta,
          expiresAt,
        },
      });
    } else {
      // New reservation
      const updated = await tx.$executeRaw`
        UPDATE "Inventory"
        SET reserved = reserved + ${qty}
        WHERE variant_id = ${variantId} AND quantity - reserved >= ${qty}
      `;
      if (updated === 0) {
        throw Object.assign(new Error("Insufficient stock available for hold"), { statusCode: 400 });
      }
      await tx.inventoryReservation.create({
        data: { variantId, cartItemId, quantity: qty, expiresAt },
      });
    }

    await tx.inventoryLog.create({
      data: {
        variantId,
        quantity: qty,
        type: "HOLD",
        note: note ?? "Cart reservation",
      },
    });
  });
}

/**
 * Release a specific cart item's reservation.
 * Uses the InventoryReservation record to know exactly how much to release,
 * preventing cross-cart interference.
 */
export async function releaseInventory(
  variantId: string,
  quantity: string | number,
  cartItemId: string,
  note?: string
) {
  const qty = Number(quantity);

  return prisma.$transaction(async (tx) => {
    const reservation = await tx.inventoryReservation.findUnique({
      where: { cartItemId },
    });

    // Release amount is the lesser of requested qty and what's actually reserved
    const releaseQty = reservation
      ? Math.min(qty, reservation.quantity)
      : 0;

    if (releaseQty <= 0) return;

    await tx.$executeRaw`
      UPDATE "Inventory"
      SET reserved = GREATEST(reserved - ${releaseQty}, 0)
      WHERE variant_id = ${variantId}
    `;

    if (reservation) {
      const remaining = reservation.quantity - releaseQty;
      if (remaining <= 0) {
        await tx.inventoryReservation.delete({ where: { id: reservation.id } });
      } else {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: { quantity: remaining },
        });
      }
    }

    await tx.inventoryLog.create({
      data: {
        variantId,
        quantity: releaseQty,
        type: "RELEASE",
        note: note ?? "Cart release",
      },
    });
  });
}

/**
 * Commit inventory: converts a soft hold into a hard sale.
 * Decrements quantity + reserved and removes the reservation record.
 */
export async function commitInventory(
  variantId: string,
  orderId: string,
  quantity: string | number,
  cartItemId: string,
  note?: string
) {
  const qty = Number(quantity);

  return prisma.$transaction(async (tx) => {
    // Delete the reservation record if it exists
    const reservation = await tx.inventoryReservation.findUnique({
      where: { cartItemId },
    });

    const reservedRelease = reservation ? Math.min(qty, reservation.quantity) : 0;

    await tx.inventory.update({
      where: { variantId },
      data: {
        quantity: { decrement: qty },
        reserved: { decrement: reservedRelease },
      },
    });

    if (reservation) {
      await tx.inventoryReservation.delete({ where: { id: reservation.id } });
    }

    await tx.inventoryLog.create({
      data: {
        variantId,
        orderId,
        quantity: -qty,
        type: "SOLD",
        note: note ?? "Order committed",
      },
    });
  });
}

export async function restockInventory(variantId: string, quantity: string | number, note?: string) {
  const qty = Number(quantity);
  return prisma.$transaction(async (tx) => {
    const inv = await tx.inventory.findUnique({ where: { variantId } });
    if (!inv) return;

    const updated = await tx.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: qty } },
    });

    await tx.inventoryLog.create({
      data: {
        variantId,
        quantity: qty,
        type: "RESTOCK",
        note: note ?? "Restock / Order Cancelled",
      },
    });

    return updated;
  });
}
