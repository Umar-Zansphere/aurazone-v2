import { prisma } from "@aurazone/database";

const REAPER_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

let reaperTimer: NodeJS.Timeout | null = null;

/**
 * Cart reaper — finds and releases expired InventoryReservation records.
 *
 * How it works:
 * 1. SELECT expired reservations (expiresAt <= now) with FOR UPDATE SKIP LOCKED
 *    semantics via an atomic claim pattern.
 * 2. For each expired reservation, in a single transaction:
 *    a. Delete the reservation record
 *    b. Decrement the variant's `reserved` counter by exactly the reservation qty
 *    c. Log it
 * 3. Mark any carts whose items have no remaining reservations as ABANDONED.
 *
 * Because reservations are owned by specific cart items, releasing one cart's
 * hold cannot interfere with another cart's reservation for the same variant.
 * The atomic delete-if-exists pattern prevents duplicate processing across
 * multiple API replicas.
 */
export async function runCartReaper() {
  try {
    const now = new Date();

    // Find all expired reservations
    const expiredReservations = await prisma.inventoryReservation.findMany({
      where: { expiresAt: { lte: now } },
      include: {
        cartItem: { include: { cart: true } },
      },
    });

    if (expiredReservations.length === 0) return;

    console.log(`[CartReaper] Found ${expiredReservations.length} expired reservations. Releasing...`);

    const affectedCartIds = new Set<string>();

    for (const reservation of expiredReservations) {
      try {
        await prisma.$transaction(async (tx) => {
          // Atomically claim: delete the reservation. If another replica already
          // deleted it, deleteMany returns count=0 and we skip.
          const deleted = await tx.inventoryReservation.deleteMany({
            where: { id: reservation.id },
          });
          if (deleted.count === 0) return; // already processed by another replica

          // Release the reserved amount from the scalar counter
          await tx.$executeRaw`
            UPDATE "Inventory"
            SET reserved = GREATEST(reserved - ${reservation.quantity}, 0)
            WHERE variant_id = ${reservation.variantId}
          `;

          await tx.inventoryLog.create({
            data: {
              variantId: reservation.variantId,
              quantity: reservation.quantity,
              type: "RELEASE",
              note: `Cart reaper released expired reservation for cart item ${reservation.cartItemId}`,
            },
          });
        });

        affectedCartIds.add(reservation.cartItem.cartId);
      } catch (err) {
        console.error(`[CartReaper] Failed to release reservation ${reservation.id}:`, err);
      }
    }

    // Mark affected carts as ABANDONED if they have no remaining active reservations
    for (const cartId of affectedCartIds) {
      const remainingReservations = await prisma.inventoryReservation.count({
        where: { cartItem: { cartId } },
      });

      if (remainingReservations === 0) {
        // Atomic: only flip ACTIVE → ABANDONED
        await prisma.cart.updateMany({
          where: { id: cartId, status: "ACTIVE" },
          data: { status: "ABANDONED" },
        });
      }
    }

    console.log(`[CartReaper] Released ${expiredReservations.length} reservations, checked ${affectedCartIds.size} carts.`);
  } catch (error) {
    console.error("[CartReaper] Error running cart reaper:", error);
  }
}

export function startCartReaper() {
  if (reaperTimer) return;
  // Run immediately on startup, then on interval
  runCartReaper();
  reaperTimer = setInterval(runCartReaper, REAPER_INTERVAL_MS);
  console.log(`[CartReaper] Started with interval ${REAPER_INTERVAL_MS}ms`);
}

export function stopCartReaper() {
  if (reaperTimer) {
    clearInterval(reaperTimer);
    reaperTimer = null;
    console.log("[CartReaper] Stopped");
  }
}
