"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Bell, CheckCheck, Check, ShoppingCart, Package,
  AlertTriangle, TrendingUp, Settings, Megaphone,
  Clock,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  url: string | null;
  icon: string | null;
  isRead: boolean;
  createdAt: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  order: <ShoppingCart size={16} />,
  shipment: <Package size={16} />,
  stock: <AlertTriangle size={16} />,
  revenue: <TrendingUp size={16} />,
  system: <Settings size={16} />,
  promo: <Megaphone size={16} />,
};

function getIcon(title: string): React.ReactNode {
  const lower = title.toLowerCase();
  if (lower.includes("order")) return ICON_MAP.order;
  if (lower.includes("ship")) return ICON_MAP.shipment;
  if (lower.includes("stock") || lower.includes("inventory")) return ICON_MAP.stock;
  if (lower.includes("revenue") || lower.includes("sale")) return ICON_MAP.revenue;
  if (lower.includes("promo") || lower.includes("campaign")) return ICON_MAP.promo;
  return ICON_MAP.system;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return "just now";
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [showUnread, setShowUnread] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "notifications", showUnread],
    queryFn: () => {
      const params = new URLSearchParams({ take: "50" });
      if (showUnread) params.set("unreadOnly", "true");
      return api.get<{ notifications: Notification[]; total: number; unreadCount: number }>(
        `/admin/notifications?${params}`
      );
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch("/admin/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="page-label">System</p>
          <h1 className="page-title">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="btn-secondary text-xs flex items-center gap-1.5"
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1 overflow-x-auto">
          <button
            onClick={() => setShowUnread(false)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${!showUnread ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"}`}
          >
            All
          </button>
          <button
            onClick={() => setShowUnread(true)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${showUnread ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"}`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`inline-flex items-center justify-center h-4 min-w-[16px] rounded-full text-[9px] font-bold ${showUnread ? "bg-white/20 text-white" : "bg-[var(--color-accent)] text-white"}`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-1">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 h-16 shimmer" />
          ))
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              {showUnread ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {showUnread ? "You're all caught up!" : "Notifications about orders, stock, and system events will appear here."}
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card flex items-start gap-4 p-4 transition-all cursor-pointer hover:shadow-md ${
                !notif.isRead ? "border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-light)]" : ""
              }`}
              onClick={() => {
                if (!notif.isRead) markReadMutation.mutate(notif.id);
                if (notif.url) window.location.href = notif.url;
              }}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                !notif.isRead
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
              }`}>
                {getIcon(notif.title)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!notif.isRead ? "font-semibold text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-[var(--color-text-disabled)] whitespace-nowrap flex items-center gap-0.5">
                    <Clock size={9} /> {timeAgo(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">{notif.body}</p>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); markReadMutation.mutate(notif.id); }}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)] shrink-0"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
