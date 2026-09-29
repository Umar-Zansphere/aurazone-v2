import { prisma } from "@aurazone/database";
import { releaseInventory } from "../services/inventory.service.js";


async function main() {
  console.log("Running abandoned cart cleaner...");
  
  // Define "abandoned" as older than 2 hours
  const ABANDONED_THRESHOLD = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const abandonedCarts = await prisma.cart.findMany({
    where: {
      status: "ACTIVE",
      updatedAt: { lt: ABANDONED_THRESHOLD },
    },
    include: { items: true },
  });

  console.log(`Found ${abandonedCarts.length} abandoned carts to clean up.`);

  for (const cart of abandonedCarts) {
    try {
      await prisma.$transaction(async (tx: any) => {
        // Mark as abandoned
        await tx.cart.update({
          where: { id: cart.id },
          data: { status: "ABANDONED" },
        });

        // Release all reserved inventory
        for (const item of cart.items) {
          // Note: using the service directly inside transaction would require passing tx.
          // Since our inventory release uses its own tx, we can just execute sequentially.
          // Alternatively, we perform raw update to avoid deadlocks:
          
          const inv = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
          if (inv) {
            const releaseQty = Math.min(item.quantity, inv.reserved);
            if (releaseQty > 0) {
              await tx.inventory.update({
                where: { id: inv.id },
                data: { reserved: { decrement: releaseQty } }
              });

              await tx.inventoryLog.create({
                data: {
                  variantId: item.variantId,
                  quantity: releaseQty,
                  type: "RELEASE",
                  note: `Cart abandoned cleanup for ${cart.id}`,
                }
              });
            }
          }
        }
      });
      console.log(`Successfully cleaned cart: ${cart.id}`);
    } catch (e) {
      console.error(`Failed to clean cart ${cart.id}`, e);
    }
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
