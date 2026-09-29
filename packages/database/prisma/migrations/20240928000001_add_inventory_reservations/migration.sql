-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- DropIndex
DROP INDEX "Payment_gateway_gateway_order_id_key";

-- CreateTable
CREATE TABLE "InventoryReservation" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "cart_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_cart_item_id_key" ON "InventoryReservation"("cart_item_id");

-- CreateIndex
CREATE INDEX "InventoryReservation_variant_id_idx" ON "InventoryReservation"("variant_id");

-- CreateIndex
CREATE INDEX "InventoryReservation_expires_at_idx" ON "InventoryReservation"("expires_at");

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_cart_item_id_fkey" FOREIGN KEY ("cart_item_id") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

