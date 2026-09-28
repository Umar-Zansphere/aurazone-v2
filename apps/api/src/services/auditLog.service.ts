import { prisma } from "@aurazone/database";

interface AuditLogParams {
  adminId: string;
  action: string;       // CREATE | UPDATE | DELETE | RESTORE | TOGGLE_STATUS
  entity: string;       // STORE | CATEGORY | PRODUCT | STOREFRONT_SECTION | ORDER | etc.
  entityId: string;
  entityName?: string;
  changes?: Record<string, unknown>;
  note?: string;
}

/**
 * Create an audit log entry for any admin action.
 */
export async function logAction(params: AuditLogParams) {
  return prisma.adminAuditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      entityName: params.entityName ?? null,
      changes: (params.changes as any) ?? undefined,
      note: params.note ?? null,
    },
  });
}

/**
 * Fetch audit logs for a specific entity or globally.
 */
export async function getAuditLogs(opts: {
  entity?: string;
  entityId?: string;
  adminId?: string;
  skip?: number;
  take?: number;
}) {
  const where: any = {};
  if (opts.entity) where.entity = opts.entity;
  if (opts.entityId) where.entityId = opts.entityId;
  if (opts.adminId) where.adminId = opts.adminId;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: opts.skip ?? 0,
      take: opts.take ?? 50,
      include: {
        admin: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { logs, total };
}
