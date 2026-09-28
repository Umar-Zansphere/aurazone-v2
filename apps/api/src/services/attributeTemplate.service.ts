import { prisma, type AttributeTemplate, type Prisma } from "@aurazone/database";

// ─── List Attribute Templates ────────────────────────────────────────────────
export async function listAttributeTemplates(opts?: {
  storeId?: string;
  categoryId?: string;
  skip?: number;
  take?: number;
}): Promise<{ templates: AttributeTemplate[]; total: number }> {
  const where: Prisma.AttributeTemplateWhereInput = {};
  if (opts?.storeId) where.storeId = opts.storeId;
  if (opts?.categoryId) where.categoryId = opts.categoryId;

  const [templates, total] = await Promise.all([
    prisma.attributeTemplate.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 100,
      include: {
        store: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.attributeTemplate.count({ where }),
  ]);

  return { templates, total };
}

// ─── Get Attribute Template by ID ────────────────────────────────────────────
export async function getAttributeTemplateById(id: string) {
  const template = await prisma.attributeTemplate.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!template) {
    throw Object.assign(new Error("Attribute template not found"), { statusCode: 404 });
  }

  return template;
}

// ─── Create Attribute Template ───────────────────────────────────────────────
export async function createAttributeTemplate(data: {
  storeId?: string | null;
  categoryId?: string | null;
  name: string;
  key: string;
  fieldType?: string;
  options?: string[] | null;
  placeholder?: string;
  helpText?: string;
  isRequired?: boolean;
  isVariant?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
}): Promise<AttributeTemplate> {
  // Verify store exists if provided
  if (data.storeId) {
    const store = await prisma.store.findUnique({ where: { id: data.storeId } });
    if (!store) throw Object.assign(new Error("Store not found"), { statusCode: 404 });
  }

  // Check for duplicate key within same store
  if (data.storeId) {
    const existing = await prisma.attributeTemplate.findFirst({
      where: { storeId: data.storeId, key: data.key },
    });
    if (existing) {
      throw Object.assign(new Error("Attribute key already exists in this store"), { statusCode: 409 });
    }
  }

  return prisma.attributeTemplate.create({
    data: {
      storeId: data.storeId ?? null,
      categoryId: data.categoryId ?? null,
      name: data.name,
      key: data.key,
      fieldType: (data.fieldType as any) ?? "TEXT",
      options: data.options ?? undefined,
      placeholder: data.placeholder ?? null,
      helpText: data.helpText ?? null,
      isRequired: data.isRequired ?? true,
      isVariant: data.isVariant ?? true,
      isFilterable: data.isFilterable ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
    include: {
      store: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

// ─── Update Attribute Template ───────────────────────────────────────────────
export async function updateAttributeTemplate(
  id: string,
  data: Partial<{
    name: string;
    key: string;
    fieldType: string;
    options: string[] | null;
    placeholder: string;
    helpText: string;
    isRequired: boolean;
    isVariant: boolean;
    isFilterable: boolean;
    sortOrder: number;
    categoryId: string | null;
  }>
): Promise<AttributeTemplate> {
  const template = await prisma.attributeTemplate.findUnique({ where: { id } });
  if (!template) {
    throw Object.assign(new Error("Attribute template not found"), { statusCode: 404 });
  }

  // Check key uniqueness if changing key
  if (data.key && data.key !== template.key && template.storeId) {
    const duplicate = await prisma.attributeTemplate.findFirst({
      where: { storeId: template.storeId, key: data.key, id: { not: id } },
    });
    if (duplicate) {
      throw Object.assign(new Error("Attribute key already exists in this store"), { statusCode: 409 });
    }
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.key !== undefined) updateData.key = data.key;
  if (data.fieldType !== undefined) updateData.fieldType = data.fieldType;
  if (data.options !== undefined) updateData.options = data.options ?? undefined;
  if (data.placeholder !== undefined) updateData.placeholder = data.placeholder;
  if (data.helpText !== undefined) updateData.helpText = data.helpText;
  if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
  if (data.isVariant !== undefined) updateData.isVariant = data.isVariant;
  if (data.isFilterable !== undefined) updateData.isFilterable = data.isFilterable;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  return prisma.attributeTemplate.update({
    where: { id },
    data: updateData,
    include: {
      store: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

// ─── Delete Attribute Template ───────────────────────────────────────────────
export async function deleteAttributeTemplate(id: string): Promise<void> {
  const template = await prisma.attributeTemplate.findUnique({ where: { id } });
  if (!template) {
    throw Object.assign(new Error("Attribute template not found"), { statusCode: 404 });
  }

  await prisma.attributeTemplate.delete({ where: { id } });
}
