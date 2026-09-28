"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { History, User, ArrowRight } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  entityName: string | null;
  changes: any;
  note: string | null;
  createdAt: string;
  admin: {
    id: string;
    fullName: string | null;
    email: string | null;
    avatar: string | null;
  };
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "var(--color-success-bg)", text: "var(--color-success-text)" },
  UPDATE: { bg: "var(--color-info-bg)", text: "var(--color-info-text)" },
  DELETE: { bg: "var(--color-danger-bg)", text: "var(--color-danger-text)" },
  RESTORE: { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" },
  TOGGLE_STATUS: { bg: "var(--color-info-bg)", text: "var(--color-info-text)" },
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function ActivityLogTab({
  storeId,
  entity,
}: {
  storeId?: string;
  entity?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs", storeId, entity],
    queryFn: () => {
      const params = new URLSearchParams({ take: "50" });
      if (entity) params.set("entity", entity);
      if (storeId && entity) params.set("entityId", storeId);
      return api.get<AuditLog[]>(`/admin/audit-logs?${params}`);
    },
  });

  const logs: AuditLog[] = (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 shimmer rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-4 fade-in">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
        <History size={16} /> Activity Log
      </h3>

      {logs.length === 0 ? (
        <div className="py-8 text-center">
          <History size={28} className="mx-auto text-[var(--color-text-tertiary)] mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">No activity yet</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Actions will appear here as changes are made</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-[var(--color-border)]" />

          <div className="space-y-0">
            {logs.map((log) => {
              const colors = ACTION_COLORS[log.action] ?? ACTION_COLORS.UPDATE;

              return (
                <div key={log.id} className="relative flex items-start gap-3 pl-9 py-3 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors -ml-2">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[11px] top-4 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-surface)]"
                    style={{ backgroundColor: colors.text }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {log.action}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {log.entity.toLowerCase().replace(/_/g, " ")}
                      </span>
                      {log.entityName && (
                        <>
                          <ArrowRight size={10} className="text-[var(--color-text-tertiary)]" />
                          <span className="text-xs font-medium text-[var(--color-text-primary)]">{log.entityName}</span>
                        </>
                      )}
                    </div>

                    {/* Changes preview */}
                    {log.changes && log.action === "UPDATE" && (
                      <div className="mt-1.5 text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-bg-base)] rounded px-2 py-1 font-mono">
                        {Object.entries(log.changes.before ?? {}).map(([key, val]) => {
                          const afterVal = (log.changes.after as any)?.[key];
                          if (String(val) === String(afterVal)) return null;
                          return (
                            <span key={key} className="block">
                              {key}: <span className="line-through text-[var(--color-danger)]">{String(val)}</span>
                              {" → "}
                              <span className="text-[var(--color-success-text)]">{String(afterVal)}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {log.note && (
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1 italic">{log.note}</p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {log.admin?.avatar ? (
                          <img src={log.admin.avatar} className="h-3.5 w-3.5 rounded-full" alt="" />
                        ) : (
                          <User size={10} className="text-[var(--color-text-tertiary)]" />
                        )}
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {log.admin?.fullName ?? log.admin?.email ?? "System"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-disabled)]">·</span>
                      <span className="text-[10px] text-[var(--color-text-disabled)]">
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
