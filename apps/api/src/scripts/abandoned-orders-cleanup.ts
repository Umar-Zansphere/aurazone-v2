import { prisma } from "@aurazone/database";
import { failOrder } from "../services/order.service.js";

async function main() {
  console.log("Running abandoned orders cleaner...");
  
  // Define "abandoned payment" as older than 30 minutes
  const ABANDONED_THRESHOLD = new Date(Date.now() - 30 * 60 * 1000);

  const abandonedOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "RAZORPAY",
      createdAt: { lt: ABANDONED_THRESHOLD },
    },
    select: { id: true }
  });

  console.log(`Found ${abandonedOrders.length} abandoned/failed payment orders to clean up.`);

  for (const order of abandonedOrders) {
    try {
      await failOrder(order.id);
      console.log(`Successfully marked order ${order.id} as FAILED and released inventory.`);
    } catch (e) {
      console.error(`Failed to fail order ${order.id}`, e);
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
