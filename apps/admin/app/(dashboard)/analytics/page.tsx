"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  BarChart3, TrendingUp, ShoppingCart, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar, Package, Store,
} from "lucide-react";

interface AnalyticsData {
  period: { days: number; since: string };
  totalRevenue: number;
  ordersByStatus: Array<{ status: string; count: number; revenue: number }>;
  revenueByDay: Array<{ day: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; store: string; orders: number; revenue: number }>;
  topStores: Array<{ name: string; orders: number; revenue: number }>;
  newCustomers: number;
}

const PERIODS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "1 Year", value: 365 },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  RECEIVED: "#3B82F6",
  SHIPPED: "#6366F1",
  DELIVERED: "#10B981",
  SUCCESS: "#059669",
  CANCELLED: "#EF4444",
  FAILED: "#DC2626",
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", days],
    queryFn: () => api.get<AnalyticsData>(`/admin/analytics?days=${days}`),
  });

  const analytics = data?.data;
  const totalOrders = analytics?.ordersByStatus.reduce((s, o) => s + o.count, 0) ?? 0;
  const maxDayRevenue = Math.max(...(analytics?.revenueByDay.map(d => d.revenue) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="page-label">System</p>
          <h1 className="page-title">Analytics</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1 overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === p.value
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={`₹${Number(analytics?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          color="#10B981"
          bgColor="#ECFDF5"
          isLoading={isLoading}
        />
        <MetricCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="#3B82F6"
          bgColor="#EFF6FF"
          isLoading={isLoading}
        />
        <MetricCard
          label="Avg Order Value"
          value={totalOrders > 0 ? `₹${Math.round(Number(analytics?.totalRevenue ?? 0) / totalOrders).toLocaleString()}` : "₹0"}
          icon={TrendingUp}
          color="#8B5CF6"
          bgColor="#F5F3FF"
          isLoading={isLoading}
        />
        <MetricCard
          label="New Customers"
          value={(analytics?.newCustomers ?? 0).toLocaleString()}
          icon={Users}
          color="#F59E0B"
          bgColor="#FFFBEB"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Calendar size={14} /> Revenue Over Time
            </h2>
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="h-48 shimmer rounded-lg" />
            ) : !analytics?.revenueByDay.length ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">No revenue data for this period</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Simple bar chart */}
                <div className="flex items-end gap-[2px] h-40">
                  {analytics.revenueByDay.map((day, i) => {
                    const height = maxDayRevenue > 0 ? (day.revenue / maxDayRevenue) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 group relative">
                        <div
                          className="w-full rounded-t bg-[var(--color-accent)] hover:bg-[var(--color-primary)] transition-colors cursor-pointer"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${new Date(day.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ₹${Number(day.revenue).toLocaleString()} (${day.orders} orders)`}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-[var(--color-text-primary)] text-white text-[9px] rounded px-2 py-1 whitespace-nowrap">
                            ₹{Number(day.revenue).toLocaleString()} · {day.orders} orders
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* X axis labels */}
                <div className="flex justify-between text-[9px] text-[var(--color-text-disabled)]">
                  <span>{analytics.revenueByDay[0] ? new Date(analytics.revenueByDay[0].day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
                  <span>{analytics.revenueByDay.at(-1) ? new Date(analytics.revenueByDay.at(-1)!.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Orders by Status</h2>
          </div>
          <div className="p-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 h-4 shimmer rounded" />
                  <div className="flex-1 h-2 shimmer rounded-full" />
                  <div className="w-8 h-4 shimmer rounded" />
                </div>
              ))
            ) : !analytics?.ordersByStatus.length ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">No data</p>
            ) : (
              analytics.ordersByStatus.map((item) => {
                const pct = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-text-secondary)]">
                        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                      </span>
                      <span className="font-medium text-[var(--color-text-primary)]">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-muted)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[item.status] ?? "#6B7280" }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="card">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Package size={14} /> Top Products
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-6 h-4 shimmer rounded" />
                  <div className="flex-1 h-4 shimmer rounded" />
                  <div className="w-16 h-4 shimmer rounded" />
                </div>
              ))
            ) : !analytics?.topProducts.length ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">No product data</div>
            ) : (
              analytics.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-[var(--color-text-disabled)] w-5 text-right">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">{p.store} · {p.orders} orders</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    ₹{Number(p.revenue).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Stores */}
        <div className="card">
          <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Store size={14} /> Revenue by Store
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-6 h-4 shimmer rounded" />
                  <div className="flex-1 h-4 shimmer rounded" />
                  <div className="w-16 h-4 shimmer rounded" />
                </div>
              ))
            ) : !analytics?.topStores.length ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">No store data</div>
            ) : (
              analytics.topStores.map((s, i) => {
                const maxRev = Math.max(...analytics.topStores.map(st => Number(st.revenue)));
                const pct = maxRev > 0 ? (Number(s.revenue) / maxRev) * 100 : 0;
                return (
                  <div key={i} className="px-5 py-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--color-text-primary)]">{s.name}</p>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        ₹{Number(s.revenue).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-muted)]">
                        <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">{s.orders} orders</span>
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

function MetricCard({
  label, value, icon: Icon, color, bgColor, isLoading,
}: {
  label: string; value: string; icon: any; color: string; bgColor: string; isLoading: boolean;
}) {
  return (
    <div className="card p-5 group hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? <span className="inline-block w-20 h-7 shimmer rounded" /> : value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: bgColor }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}