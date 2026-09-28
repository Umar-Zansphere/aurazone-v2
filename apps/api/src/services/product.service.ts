import { prisma, type Product, type Prisma } from "@aurazone/database";
import { slugify, buildSku } from "@aurazone/utils";
import { logAction } from "./auditLog.service.js";

export async function listProducts(opts?: {
  storeId?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  includeDeleted?: boolean;
  sortBy?: string;
  skip?: number;
  take?: number;
}): Promise<{ products: Product[]; total: number }> {
  const where: Prisma.ProductWhereInput = {};

  // Exclude soft-deleted by default
  if (!opts?.includeDeleted) where.deletedAt = null;

  if (opts?.storeId) where.storeId = opts.storeId;
  if (opts?.categoryId) where.categoryId = opts.categoryId;
  if (opts?.isActive !== undefined) where.isActive = opts.isActive;
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { slug: { contains: opts.search, mode: "insensitive" } },
      { description: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (opts?.sortBy) {
    case "name_asc": orderBy = { name: "asc" }; break;
    case "name_desc": orderBy = { name: "desc" }; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
    case "oldest": orderBy = { createdAt: "asc" }; break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 24,
      include: {
        store: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { isAvailable: true, deletedAt: null }, take: 1, orderBy: { price: "asc" },
          select: {
            id: true, price: true, compareAtPrice: true,
            images: { take: 1, orderBy: { position: "asc" } },
          },
        },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      store: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { deletedAt: null },
        include: {
          attributes: true,
          images: { orderBy: { position: "asc" } },
          inventory: true,
        },
      },
      _count: { select: { variants: true } },
    },
  });
  if (!product || product.deletedAt) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  return product;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { deletedAt: null },
        include: {
          attributes: true,
          images: { orderBy: { position: "asc" } },
          inventory: true,
          _count: { select: { orderItems: true } },
        },
      },
      _count: { select: { variants: true } },
    },
  });
  if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  return product;
}

export async function createProduct(
  data: {
    storeId: string;
    categoryId: string;
    name: string;
    slug?: string;
    brand?: string;
    description?: string;
    shortDescription?: string;
    tags?: string[];
    hasVariants?: boolean;
    isActive?: boolean;
    isFeatured?: boolean;
    variants: Array<{
      sku?: string;
      price: number;
      compareAtPrice?: number;
      attributes?: Array<{ key: string; value: string }>;
    }>;
  },
  adminId?: string
): Promise<Product> {
  const [store, category] = await Promise.all([
    prisma.store.findUnique({ where: { id: data.storeId } }),
    prisma.category.findUnique({ where: { id: data.categoryId } }),
  ]);
  if (!store) throw Object.assign(new Error("Store not found"), { statusCode: 404 });
  if (!category) throw Object.assign(new Error("Category not found"), { statusCode: 404 });

  const slug = data.slug ?? slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw Object.assign(new Error("Product slug already taken"), { statusCode: 409 });

  const product = await prisma.product.create({
    data: {
      storeId: data.storeId,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      brand: data.brand ?? null,
      description: data.description ?? null,
      shortDescription: data.shortDescription ?? null,
      tags: data.tags ?? [],
      hasVariants: data.hasVariants ?? true,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      variants: {
        create: data.variants.map((v, i) => ({
          sku: v.sku ?? buildSku(store.slug, slug, String(i)),
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          isAvailable: true,
          attributes: v.attributes
            ? { create: v.attributes.map((a) => ({ key: a.key, value: a.value })) }
            : undefined,
        })),
      },
    },
    include: { variants: { include: { attributes: true } } },
  });

  if (adminId) {
    await logAction({
      adminId,
      action: "CREATE",
      entity: "PRODUCT",
      entityId: product.id,
      entityName: product.name,
    });
  }

  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string; slug: string; description: string;
    shortDescription: string; brand: string;
    categoryId: string; isActive: boolean; isFeatured: boolean;
    tags: string[];
  }>,
  adminId?: string
): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404 });

  if (data.slug && data.slug !== product.slug) {
    const slugTaken = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (slugTaken) throw Object.assign(new Error("Product slug already taken"), { statusCode: 409 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
      ...(data.brand !== undefined && { brand: data.brand }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
    include: { variants: { include: { attributes: true } } },
  });

  if (adminId) {
    await logAction({
      adminId,
      action: data.isActive !== undefined && data.isActive !== product.isActive ? "TOGGLE_STATUS" : "UPDATE",
      entity: "PRODUCT",
      entityId: id,
      entityName: updated.name,
      changes: { before: { name: product.name, isActive: product.isActive }, after: { name: updated.name, isActive: updated.isActive } },
    });
  }

  return updated;
}

export async function deleteProduct(id: string, adminId?: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { include: { _count: { select: { orderItems: true } } } },
    },
  });
  if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404 });

  // Soft delete — mark as deleted
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: adminId ?? null, isActive: false },
  });

  if (adminId) {
    await logAction({
      adminId,
      action: "DELETE",
      entity: "PRODUCT",
      entityId: id,
      entityName: product.name,
    });
  }
}

export async function restoreProduct(id: string, adminId?: string): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  if (!product.deletedAt) {
    throw Object.assign(new Error("Product is not deleted"), { statusCode: 400 });
  }

  const restored = await prisma.product.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null, isActive: true },
    include: { variants: { include: { attributes: true } } },
  });

  if (adminId) {
    await logAction({
      adminId,
      action: "RESTORE",
      entity: "PRODUCT",
      entityId: id,
      entityName: restored.name,
    });
  }

  return restored;
}