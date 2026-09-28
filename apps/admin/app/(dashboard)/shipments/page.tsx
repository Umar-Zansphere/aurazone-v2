"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Truck, Search, Package, Clock, CheckCircle,
  ExternalLink, Plus, X,
} from "lucide-react";
import Link from "next/link";

interface Shipment {
  id: string;
  orderId: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    user: { fullName: string | null; email: string } | null;
  };
}

const STATUSES = ["PENDING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED", "LOST"];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-indigo-100 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-orange-100 text-orange-700",
  LOST: "bg-red-100 text-red-700",
};

export default function ShipmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ orderId: "", courierName: "", trackingNumber: "", trackingUrl: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "shipments", search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      return api.get<Shipment[]>(`/admin/shipments?${params}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; courierName?: string; trackingNumber?: string; trackingUrl?: string }) =>
      api.patch(`/admin/shipments/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] }),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof createForm) => api.post("/admin/shipments", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipments"] });
      setShowCreate(false);
      setCreateForm({ orderId: "", courierName: "", trackingNumber: "", trackingUrl: "" });
    },
  });

  const shipments = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="page-label">Operations</p>
          <h1 className="page-title">Shipments</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 w-72">
          <Search size={14} className="text-[var(--color-text-tertiary)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking # or order #..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)]" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1">
          <button onClick={() => setStatusFilter("")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${!statusFilter ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"}`}>
            All
          </button>
          {STATUSES.slice(0, 5).map((s) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"}`}>
              {s.replace(/_/g, " ").charAt(0) + s.replace(/_/g, " ").slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Order</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Courier</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Tracking</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 w-36 text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-5 py-3"><div className="w-20 h-4 shimmer rounded" /></td>
                ))}</tr>
              ))
            ) : shipments.map((s) => (
              <tr key={s.id} className="hover:bg-[var(--color-bg-muted)] transition-colors group">
                <td className="px-5 py-3">
                  <Link href={`/orders/${s.order.id}`} className="text-xs font-mono text-[var(--color-accent)] hover:underline">
                    {s.order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-[var(--color-text-primary)]">{s.order.user?.fullName ?? "Guest"}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">{s.order.user?.email ?? ""}</p>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-secondary)]">{s.courierName ?? "—"}</td>
                <td className="px-5 py-3">
                  {s.trackingNumber ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-[var(--color-text-secondary)]">{s.trackingNumber}</span>
                      {s.trackingUrl && (
                        <a href={s.trackingUrl} target="_blank" rel="noreferrer"
                          className="text-[var(--color-accent)] hover:underline">
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--color-text-tertiary)]">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-secondary)]">
                  {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3">
                  <select
                    value={s.status}
                    onChange={(e) => updateMutation.mutate({ id: s.id, status: e.target.value })}
                    className="form-input py-1 px-2 text-xs w-full"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st.replace(/_/g, " ").charAt(0) + st.replace(/_/g, " ").slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && shipments.length === 0 && (
          <div className="p-12 text-center">
            <Truck size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">No shipments yet</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Shipments will appear when you create them for orders.
            </p>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Create Shipment</h3>
              <button onClick={() => setShowCreate(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"><X size={16} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(createForm); }} className="space-y-3">
              <div>
                <label className="form-label">Order ID</label>
                <input type="text" className="form-input" required value={createForm.orderId}
                  onChange={(e) => setCreateForm(f => ({ ...f, orderId: e.target.value }))}
                  placeholder="Paste order UUID" />
              </div>
              <div>
                <label className="form-label">Courier Name</label>
                <input type="text" className="form-input" value={createForm.courierName}
                  onChange={(e) => setCreateForm(f => ({ ...f, courierName: e.target.value }))}
                  placeholder="e.g. BlueDart, DTDC" />
              </div>
              <div>
                <label className="form-label">Tracking Number</label>
                <input type="text" className="form-input font-mono" value={createForm.trackingNumber}
                  onChange={(e) => setCreateForm(f => ({ ...f, trackingNumber: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Tracking URL</label>
                <input type="url" className="form-input text-xs" value={createForm.trackingUrl}
                  onChange={(e) => setCreateForm(f => ({ ...f, trackingUrl: e.target.value }))}
                  placeholder="https://..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Shipment"}
                </button>
              </div>
              {createMutation.error && (
                <p className="text-xs text-[var(--color-danger)]">{createMutation.error.message}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}