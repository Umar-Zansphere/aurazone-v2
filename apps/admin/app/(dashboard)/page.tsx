"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Store, Package, ShoppingCart, Users,
  TrendingUp, ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";

interface DashboardData {
  stats: {
    totalStores: number;
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { fullName: string | null; email: string };
    items: Array<{ quantity: number }>;
  }>;
  ordersByStatus: Array<{ status: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  SUCCESS: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<DashboardData>("/admin/dashboard"),
  });

  const stats = data?.data?.stats;
  const recentOrders = data?.data?.recentOrders ?? [];
  const ordersByStatus = data?.data?.ordersByStatus ?? [];

  const statCards = [
    {
      label: "Total Stores",
      value: stats?.totalStores ?? 0,
      icon: Store,
      color: "var(--color-accent)",
      bgColor: "var(--color-accent-light)",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
    {
      label: "Total Customers",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="page-label">Overview</p>
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5 group hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
                  {isLoading ? (
                    <span className="inline-block w-16 h-7 shimmer rounded" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: card.bgColor }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Recent Orders
            </h2>
            <a href="/orders" className="text-xs text-[var(--color-accent)] hover:underline">
              View all
            </a>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-20 h-4 shimmer rounded" />
                  <div className="flex-1 h-4 shimmer rounded" />
                  <div className="w-16 h-5 shimmer rounded-full" />
                  <div className="w-20 h-4 shimmer rounded" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                No orders yet
              </div>
            ) : (
              recentOrders.map((order) => (
                <a
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  <span className="text-xs font-mono text-[var(--color-text-secondary)] w-24">
                    {order.orderNumber}
                  </span>
                  <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate">
                    {order.user?.fullName ?? order.user?.email ?? "Guest"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)] w-20 text-right">
                    {"\u20B9"}{Number(order.totalAmount).toLocaleString()}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Orders by Status
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 h-4 shimmer rounded" />
                  <div className="flex-1 h-2 shimmer rounded-full" />
                  <div className="w-8 h-4 shimmer rounded" />
                </div>
              ))
            ) : ordersByStatus.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">
                No data yet
              </p>
            ) : (
              ordersByStatus.map((item) => {
                const total = ordersByStatus.reduce((s, i) => s + i.count, 0);
                const pct = total > 0 ? (item.count / total) * 100 : 0;
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-text-secondary)]">{item.status}</span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}