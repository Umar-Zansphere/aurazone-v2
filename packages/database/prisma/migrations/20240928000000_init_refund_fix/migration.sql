-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'STORE_MANAGER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('LOGIN', 'SIGNUP', 'RESET_PASSWORD', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'KIDS');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ORDERED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'RECEIVED', 'SHIPPED', 'DELIVERED', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('RAZORPAY', 'COD');

-- CreateEnum
CREATE TYPE "OrderShipmentStatus" AS ENUM ('PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'LOST');

-- CreateEnum
CREATE TYPE "InventoryLogType" AS ENUM ('HOLD', 'RELEASE', 'SOLD', 'MANUAL', 'RESTOCK', 'RETURN');

-- CreateEnum
CREATE TYPE "EmailDeliveryState" AS ENUM ('SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AttributeFieldType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'COLOR_PICKER', 'BOOLEAN', 'MEDIA');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('HERO_BANNER', 'PRODUCT_CAROUSEL', 'CATEGORY_GRID', 'STORE_GRID', 'PROMO_BANNER', 'TEXT_BLOCK', 'IMAGE_GALLERY', 'COUNTDOWN_TIMER', 'CUSTOM_HTML');

-- CreateTable
CREATE TABLE "User" (
"id" TEXT NOT NULL,
"email" VARCHAR(255),
"password" VARCHAR(255),
"phone" VARCHAR(20),
"full_name" VARCHAR(255),
"avatar" TEXT,
"email_verification_token" TEXT,
"is_email_verified" TIMESTAMP(3),
"is_phone_verified" TIMESTAMP(3),
"is_active" BOOLEAN NOT NULL DEFAULT false,
"is_guest" BOOLEAN NOT NULL DEFAULT true,
"last_login_at" TIMESTAMPTZ(6),
"password_reset_token" TEXT,
"password_reset_expires" TIMESTAMP(3),
"role" "Role" NOT NULL DEFAULT 'CUSTOMER',
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3),

CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSession" (
"id" TEXT NOT NULL,
"session_id" TEXT NOT NULL,
"expires_at" TIMESTAMP(3) NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
"id" TEXT NOT NULL,
"user_id" TEXT NOT NULL,
"refresh_token_hash" TEXT NOT NULL,
"device_info" TEXT NOT NULL,
"ip_address" TEXT NOT NULL,
"expires_at" TIMESTAMP(3) NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
"id" TEXT NOT NULL,
"user_id" TEXT,
"session_id" TEXT,
"phone" VARCHAR(20),
"email" VARCHAR(255),
"identifier" TEXT NOT NULL DEFAULT 'phone',
"otp_hash" TEXT NOT NULL,
"purpose" "Purpose" NOT NULL,
"expires_at" TIMESTAMP(3) NOT NULL,
"verified_at" TIMESTAMP(3),
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
"id" TEXT NOT NULL,
"user_id" TEXT,
"name" TEXT NOT NULL,
"phone" VARCHAR(20) NOT NULL,
"address_line_1" TEXT NOT NULL,
"address_line_2" TEXT,
"city" TEXT NOT NULL,
"state" TEXT NOT NULL,
"postal_code" TEXT NOT NULL,
"country" TEXT NOT NULL DEFAULT 'IN',
"is_default" BOOLEAN NOT NULL DEFAULT false,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
"id" TEXT NOT NULL,
"slug" TEXT NOT NULL,
"name" TEXT NOT NULL,
"description" TEXT,
"logo_url" TEXT,
"banner_url" TEXT,
"accent_color" TEXT,
"is_active" BOOLEAN NOT NULL DEFAULT true,
"sort_order" INTEGER NOT NULL DEFAULT 0,
"deleted_at" TIMESTAMP(3),
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
"id" TEXT NOT NULL,
"store_id" TEXT NOT NULL,
"parent_id" TEXT,
"slug" TEXT NOT NULL,
"name" TEXT NOT NULL,
"description" TEXT,
"image_url" TEXT,
"is_active" BOOLEAN NOT NULL DEFAULT true,
"sort_order" INTEGER NOT NULL DEFAULT 0,
"deleted_at" TIMESTAMP(3),
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreManager" (
"id" TEXT NOT NULL,
"user_id" TEXT NOT NULL,
"store_id" TEXT NOT NULL,

CONSTRAINT "StoreManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeTemplate" (
"id" TEXT NOT NULL,
"store_id" TEXT,
"category_id" TEXT,
"name" TEXT NOT NULL,
"key" TEXT NOT NULL,
"field_type" "AttributeFieldType" NOT NULL DEFAULT 'TEXT',
"options" JSONB,
"placeholder" TEXT,
"help_text" TEXT,
"is_required" BOOLEAN NOT NULL DEFAULT true,
"is_variant" BOOLEAN NOT NULL DEFAULT true,
"is_filterable" BOOLEAN NOT NULL DEFAULT true,
"sort_order" INTEGER NOT NULL DEFAULT 0,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "AttributeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
"id" TEXT NOT NULL,
"store_id" TEXT NOT NULL,
"category_id" TEXT NOT NULL,
"slug" TEXT NOT NULL,
"name" VARCHAR(255) NOT NULL,
"brand" VARCHAR(255),
"model_number" VARCHAR(255),
"gender" "Gender",
"description" TEXT,
"short_description" VARCHAR(500),
"tags" TEXT[],
"metadata" JSONB,
"has_variants" BOOLEAN NOT NULL DEFAULT true,
"is_active" BOOLEAN NOT NULL DEFAULT true,
"is_featured" BOOLEAN NOT NULL DEFAULT false,
"deleted_at" TIMESTAMP(3),
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
"id" TEXT NOT NULL,
"product_id" TEXT NOT NULL,
"sku" TEXT NOT NULL,
"price" DECIMAL(10,2) NOT NULL,
"compare_at_price" DECIMAL(10,2),
"is_available" BOOLEAN NOT NULL DEFAULT true,
"deleted_at" TIMESTAMP(3),
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantAttribute" (
"id" TEXT NOT NULL,
"variant_id" TEXT NOT NULL,
"key" TEXT NOT NULL,
"value" TEXT NOT NULL,

CONSTRAINT "ProductVariantAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
"id" TEXT NOT NULL,
"variant_id" TEXT NOT NULL,
"url" TEXT NOT NULL,
"alt_text" TEXT NOT NULL,
"position" INTEGER NOT NULL,
"is_primary" BOOLEAN NOT NULL DEFAULT false,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
"id" TEXT NOT NULL,
"variant_id" TEXT NOT NULL,
"quantity" INTEGER NOT NULL,
"reserved" INTEGER NOT NULL DEFAULT 0,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLog" (
"id" TEXT NOT NULL,
"variant_id" TEXT NOT NULL,
"order_id" TEXT,
"quantity" INTEGER NOT NULL,
"type" "InventoryLogType" NOT NULL,
"performed_by" TEXT,
"note" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReview" (
"id" TEXT NOT NULL,
"product_id" TEXT NOT NULL,
"user_id" TEXT NOT NULL,
"rating" INTEGER NOT NULL,
"body" TEXT,
"is_approved" BOOLEAN NOT NULL DEFAULT true,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
"id" TEXT NOT NULL,
"user_id" TEXT,
"session_id" TEXT,
"status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
"id" TEXT NOT NULL,
"cart_id" TEXT NOT NULL,
"product_id" TEXT NOT NULL,
"variant_id" TEXT NOT NULL,
"quantity" INTEGER NOT NULL,
"unit_price" DECIMAL(10,2) NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
"id" TEXT NOT NULL,
"user_id" TEXT,
"session_id" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
"id" TEXT NOT NULL,
"wishlist_id" TEXT NOT NULL,
"product_id" TEXT NOT NULL,
"variant_id" TEXT,
"added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
"id" TEXT NOT NULL,
"user_id" TEXT,
"session_id" TEXT,
"order_number" TEXT NOT NULL,
"tracking_token" TEXT,
"status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
"payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
"payment_method" "PaymentGateway" NOT NULL,
"razorpay_order_id" TEXT,
"razorpay_payment_id" TEXT,
"total_amount" DECIMAL(12,2) NOT NULL,
"coupon_id" TEXT,
"discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
"notes" TEXT,
"deleted_at" TIMESTAMP(3),
"delete_reason" TEXT,
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
"id" TEXT NOT NULL,
"order_id" TEXT NOT NULL,
"variant_id" TEXT NOT NULL,
"product_name" TEXT NOT NULL,
"product_slug" TEXT NOT NULL,
"store_name" TEXT NOT NULL,
"image_url" TEXT,
"attributes_snapshot" JSONB NOT NULL,
"price" DECIMAL(10,2) NOT NULL,
"quantity" INTEGER NOT NULL,
"subtotal" DECIMAL(12,2) NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAddress" (
"id" TEXT NOT NULL,
"order_id" TEXT NOT NULL,
"name" TEXT NOT NULL,
"phone" TEXT,
"email" TEXT,
"address_line_1" TEXT NOT NULL,
"address_line_2" TEXT,
"city" TEXT NOT NULL,
"state" TEXT NOT NULL,
"postal_code" TEXT NOT NULL,
"country" TEXT NOT NULL DEFAULT 'IN',

CONSTRAINT "OrderAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
"id" TEXT NOT NULL,
"order_id" TEXT NOT NULL,
"gateway" "PaymentGateway" NOT NULL,
"gateway_order_id" TEXT,
"gateway_payment_id" TEXT,
"external_reference" TEXT,
"idempotency_key" TEXT,
"amount" DECIMAL(12,2) NOT NULL,
"status" "PaymentStatus" NOT NULL,
"paid_at" TIMESTAMP(3),
"note" TEXT,
"metadata" JSONB,
"deleted_at" TIMESTAMP(3),
"delete_reason" TEXT,
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderShipment" (
"id" TEXT NOT NULL,
"order_id" TEXT NOT NULL,
"courier_name" TEXT,
"tracking_number" TEXT,
"tracking_url" TEXT,
"status" "OrderShipmentStatus" NOT NULL DEFAULT 'PENDING',
"shipped_at" TIMESTAMP(3),
"delivered_at" TIMESTAMP(3),
"deleted_at" TIMESTAMP(3),
"delete_reason" TEXT,
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "OrderShipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLog" (
"id" TEXT NOT NULL,
"order_id" TEXT,
"order_number_snapshot" TEXT,
"admin_id" TEXT,
"action" VARCHAR(50) NOT NULL,
"from_status" "OrderStatus",
"to_status" "OrderStatus",
"from_payment_status" "PaymentStatus",
"to_payment_status" "PaymentStatus",
"note" TEXT,
"metadata" JSONB,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLog" (
"id" TEXT NOT NULL,
"payment_id" TEXT,
"order_id" TEXT,
"order_number_snapshot" TEXT,
"admin_id" TEXT,
"action" VARCHAR(50) NOT NULL,
"from_status" "PaymentStatus",
"to_status" "PaymentStatus",
"amount" DECIMAL(12,2),
"note" TEXT,
"metadata" JSONB,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentLog" (
"id" TEXT NOT NULL,
"order_id" TEXT,
"order_number_snapshot" TEXT,
"shipment_id" TEXT,
"admin_id" TEXT,
"action" VARCHAR(50) NOT NULL,
"from_status" "OrderShipmentStatus",
"to_status" "OrderShipmentStatus",
"courier_name" TEXT,
"tracking_number" TEXT,
"tracking_url" TEXT,
"note" TEXT,
"metadata" JSONB,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "ShipmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusEmailLog" (
"id" TEXT NOT NULL,
"order_id" TEXT NOT NULL,
"admin_id" TEXT,
"recipient_email" TEXT,
"status_snapshot" "OrderStatus" NOT NULL,
"template" VARCHAR(100) NOT NULL,
"subject" TEXT NOT NULL,
"provider_message_id" TEXT,
"state" "EmailDeliveryState" NOT NULL DEFAULT 'FAILED',
"error_message" TEXT,
"metadata" JSONB,
"sent_at" TIMESTAMP(3),
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "OrderStatusEmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontSection" (
"id" TEXT NOT NULL,
"store_id" TEXT,
"page" TEXT NOT NULL DEFAULT 'home',
"type" "SectionType" NOT NULL,
"title" TEXT,
"subtitle" TEXT,
"content" JSONB NOT NULL,
"is_active" BOOLEAN NOT NULL DEFAULT true,
"sort_order" INTEGER NOT NULL DEFAULT 0,
"start_date" TIMESTAMP(3),
"end_date" TIMESTAMP(3),
"deleted_at" TIMESTAMP(3),
"deleted_by" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "StorefrontSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
"id" TEXT NOT NULL,
"admin_id" TEXT NOT NULL,
"action" VARCHAR(50) NOT NULL,
"entity" VARCHAR(50) NOT NULL,
"entity_id" TEXT NOT NULL,
"entity_name" TEXT,
"changes" JSONB,
"note" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
"id" TEXT NOT NULL,
"user_id" TEXT,
"session_id" TEXT,
"endpoint" TEXT NOT NULL,
"p256dh" TEXT NOT NULL,
"auth" TEXT NOT NULL,
"user_agent" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationHistory" (
"id" TEXT NOT NULL,
"user_id" TEXT NOT NULL,
"title" TEXT NOT NULL,
"body" TEXT NOT NULL,
"url" TEXT,
"icon" TEXT,
"is_read" BOOLEAN NOT NULL DEFAULT false,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
"id" TEXT NOT NULL,
"user_id" TEXT NOT NULL,
"new_orders" BOOLEAN NOT NULL DEFAULT true,
"order_status_change" BOOLEAN NOT NULL DEFAULT true,
"low_stock" BOOLEAN NOT NULL DEFAULT true,
"promotions" BOOLEAN NOT NULL DEFAULT true,
"other_events" BOOLEAN NOT NULL DEFAULT true,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
"id" TEXT NOT NULL,
"code" TEXT NOT NULL,
"description" TEXT,
"discount_type" "DiscountType" NOT NULL,
"discount_value" DECIMAL(10,2) NOT NULL,
"min_order_value" DECIMAL(10,2),
"max_discount" DECIMAL(10,2),
"usage_limit" INTEGER,
"used_count" INTEGER NOT NULL DEFAULT 0,
"start_date" TIMESTAMP(3),
"end_date" TIMESTAMP(3),
"is_active" BOOLEAN NOT NULL DEFAULT true,
"store_id" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3),

CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_verification_token_key" ON "User"("email_verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_reset_token_key" ON "User"("password_reset_token");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_session_id_key" ON "GuestSession"("session_id");

-- CreateIndex
CREATE INDEX "GuestSession_session_id_idx" ON "GuestSession"("session_id");

-- CreateIndex
CREATE INDEX "GuestSession_expires_at_idx" ON "GuestSession"("expires_at");

-- CreateIndex
CREATE INDEX "UserSession_user_id_idx" ON "UserSession"("user_id");

-- CreateIndex
CREATE INDEX "UserSession_expires_at_idx" ON "UserSession"("expires_at");

-- CreateIndex
CREATE INDEX "OtpVerification_user_id_idx" ON "OtpVerification"("user_id");

-- CreateIndex
CREATE INDEX "OtpVerification_session_id_idx" ON "OtpVerification"("session_id");

-- CreateIndex
CREATE INDEX "Address_user_id_idx" ON "Address"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_slug_idx" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_is_active_sort_order_idx" ON "Store"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "Store_deleted_at_idx" ON "Store"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_store_id_idx" ON "Category"("store_id");

-- CreateIndex
CREATE INDEX "Category_parent_id_idx" ON "Category"("parent_id");

-- CreateIndex
CREATE INDEX "Category_is_active_sort_order_idx" ON "Category"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "Category_deleted_at_idx" ON "Category"("deleted_at");

-- CreateIndex
CREATE INDEX "StoreManager_user_id_idx" ON "StoreManager"("user_id");

-- CreateIndex
CREATE INDEX "StoreManager_store_id_idx" ON "StoreManager"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "StoreManager_user_id_store_id_key" ON "StoreManager"("user_id", "store_id");

-- CreateIndex
CREATE INDEX "AttributeTemplate_store_id_idx" ON "AttributeTemplate"("store_id");

-- CreateIndex
CREATE INDEX "AttributeTemplate_category_id_idx" ON "AttributeTemplate"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_store_id_idx" ON "Product"("store_id");

-- CreateIndex
CREATE INDEX "Product_category_id_idx" ON "Product"("category_id");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_is_active_is_featured_idx" ON "Product"("is_active", "is_featured");

-- CreateIndex
CREATE INDEX "Product_created_at_idx" ON "Product"("created_at");

-- CreateIndex
CREATE INDEX "Product_deleted_at_idx" ON "Product"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_product_id_idx" ON "ProductVariant"("product_id");

-- CreateIndex
CREATE INDEX "ProductVariant_is_available_idx" ON "ProductVariant"("is_available");

-- CreateIndex
CREATE INDEX "ProductVariant_deleted_at_idx" ON "ProductVariant"("deleted_at");

-- CreateIndex
CREATE INDEX "ProductVariantAttribute_variant_id_idx" ON "ProductVariantAttribute"("variant_id");

-- CreateIndex
CREATE INDEX "ProductVariantAttribute_key_value_idx" ON "ProductVariantAttribute"("key", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantAttribute_variant_id_key_key" ON "ProductVariantAttribute"("variant_id", "key");

-- CreateIndex
CREATE INDEX "ProductImage_variant_id_idx" ON "ProductImage"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_variant_id_key" ON "Inventory"("variant_id");

-- CreateIndex
CREATE INDEX "Inventory_quantity_idx" ON "Inventory"("quantity");

-- CreateIndex
CREATE INDEX "InventoryLog_variant_id_idx" ON "InventoryLog"("variant_id");

-- CreateIndex
CREATE INDEX "InventoryLog_order_id_idx" ON "InventoryLog"("order_id");

-- CreateIndex
CREATE INDEX "ProductReview_product_id_idx" ON "ProductReview"("product_id");

-- CreateIndex
CREATE INDEX "ProductReview_user_id_idx" ON "ProductReview"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReview_product_id_user_id_key" ON "ProductReview"("product_id", "user_id");

-- CreateIndex
CREATE INDEX "Cart_user_id_idx" ON "Cart"("user_id");

-- CreateIndex
CREATE INDEX "Cart_session_id_idx" ON "Cart"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_user_id_status_key" ON "Cart"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_session_id_status_key" ON "Cart"("session_id", "status");

-- CreateIndex
CREATE INDEX "CartItem_cart_id_idx" ON "CartItem"("cart_id");

-- CreateIndex
CREATE INDEX "CartItem_product_id_idx" ON "CartItem"("product_id");

-- CreateIndex
CREATE INDEX "CartItem_variant_id_idx" ON "CartItem"("variant_id");

-- CreateIndex
CREATE INDEX "Wishlist_user_id_idx" ON "Wishlist"("user_id");

-- CreateIndex
CREATE INDEX "Wishlist_session_id_idx" ON "Wishlist"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_user_id_key" ON "Wishlist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_session_id_key" ON "Wishlist"("session_id");

-- CreateIndex
CREATE INDEX "WishlistItem_wishlist_id_idx" ON "WishlistItem"("wishlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlist_id_product_id_variant_id_key" ON "WishlistItem"("wishlist_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tracking_token_key" ON "Order"("tracking_token");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpay_order_id_key" ON "Order"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpay_payment_id_key" ON "Order"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "Order_order_number_idx" ON "Order"("order_number");

-- CreateIndex
CREATE INDEX "Order_tracking_token_idx" ON "Order"("tracking_token");

-- CreateIndex
CREATE INDEX "Order_user_id_idx" ON "Order"("user_id");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_created_at_idx" ON "Order"("created_at");

-- CreateIndex
CREATE INDEX "Order_deleted_at_idx" ON "Order"("deleted_at");

-- CreateIndex
CREATE INDEX "OrderItem_order_id_idx" ON "OrderItem"("order_id");

-- CreateIndex
CREATE INDEX "OrderItem_variant_id_idx" ON "OrderItem"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderAddress_order_id_key" ON "OrderAddress"("order_id");

-- CreateIndex
CREATE INDEX "Payment_order_id_idx" ON "Payment"("order_id");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_created_at_idx" ON "Payment"("created_at");

-- CreateIndex
CREATE INDEX "Payment_deleted_at_idx" ON "Payment"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gateway_gateway_payment_id_key" ON "Payment"("gateway", "gateway_payment_id");

-- CreateIndex
CREATE INDEX "OrderShipment_order_id_idx" ON "OrderShipment"("order_id");

-- CreateIndex
CREATE INDEX "OrderShipment_status_idx" ON "OrderShipment"("status");

-- CreateIndex
CREATE INDEX "OrderShipment_deleted_at_idx" ON "OrderShipment"("deleted_at");

-- CreateIndex
CREATE INDEX "OrderLog_order_id_idx" ON "OrderLog"("order_id");

-- CreateIndex
CREATE INDEX "OrderLog_admin_id_idx" ON "OrderLog"("admin_id");

-- CreateIndex
CREATE INDEX "OrderLog_created_at_idx" ON "OrderLog"("created_at");

-- CreateIndex
CREATE INDEX "PaymentLog_payment_id_idx" ON "PaymentLog"("payment_id");

-- CreateIndex
CREATE INDEX "PaymentLog_order_id_idx" ON "PaymentLog"("order_id");

-- CreateIndex
CREATE INDEX "PaymentLog_created_at_idx" ON "PaymentLog"("created_at");

-- CreateIndex
CREATE INDEX "ShipmentLog_order_id_idx" ON "ShipmentLog"("order_id");

-- CreateIndex
CREATE INDEX "ShipmentLog_shipment_id_idx" ON "ShipmentLog"("shipment_id");

-- CreateIndex
CREATE INDEX "ShipmentLog_created_at_idx" ON "ShipmentLog"("created_at");

-- CreateIndex
CREATE INDEX "OrderStatusEmailLog_order_id_idx" ON "OrderStatusEmailLog"("order_id");

-- CreateIndex
CREATE INDEX "OrderStatusEmailLog_state_idx" ON "OrderStatusEmailLog"("state");

-- CreateIndex
CREATE INDEX "OrderStatusEmailLog_created_at_idx" ON "OrderStatusEmailLog"("created_at");

-- CreateIndex
CREATE INDEX "StorefrontSection_store_id_page_is_active_idx" ON "StorefrontSection"("store_id", "page", "is_active");

-- CreateIndex
CREATE INDEX "StorefrontSection_page_sort_order_idx" ON "StorefrontSection"("page", "sort_order");

-- CreateIndex
CREATE INDEX "StorefrontSection_start_date_end_date_idx" ON "StorefrontSection"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "StorefrontSection_deleted_at_idx" ON "StorefrontSection"("deleted_at");

-- CreateIndex
CREATE INDEX "AdminAuditLog_admin_id_idx" ON "AdminAuditLog"("admin_id");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entity_entity_id_idx" ON "AdminAuditLog"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "AdminAuditLog_created_at_idx" ON "AdminAuditLog"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_user_id_idx" ON "PushSubscription"("user_id");

-- CreateIndex
CREATE INDEX "PushSubscription_session_id_idx" ON "PushSubscription"("session_id");

-- CreateIndex
CREATE INDEX "NotificationHistory_user_id_idx" ON "NotificationHistory"("user_id");

-- CreateIndex
CREATE INDEX "NotificationHistory_is_read_idx" ON "NotificationHistory"("is_read");

-- CreateIndex
CREATE INDEX "NotificationHistory_created_at_idx" ON "NotificationHistory"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_user_id_key" ON "NotificationPreferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_store_id_idx" ON "Coupon"("store_id");

-- CreateIndex
CREATE INDEX "Coupon_is_active_idx" ON "Coupon"("is_active");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreManager" ADD CONSTRAINT "StoreManager_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreManager" ADD CONSTRAINT "StoreManager_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeTemplate" ADD CONSTRAINT "AttributeTemplate_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeTemplate" ADD CONSTRAINT "AttributeTemplate_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantAttribute" ADD CONSTRAINT "ProductVariantAttribute_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAddress" ADD CONSTRAINT "OrderAddress_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderShipment" ADD CONSTRAINT "OrderShipment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentLog" ADD CONSTRAINT "ShipmentLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentLog" ADD CONSTRAINT "ShipmentLog_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "OrderShipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentLog" ADD CONSTRAINT "ShipmentLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEmailLog" ADD CONSTRAINT "OrderStatusEmailLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontSection" ADD CONSTRAINT "StorefrontSection_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

