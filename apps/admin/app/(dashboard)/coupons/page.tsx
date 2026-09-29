"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, Tag, Calendar, MoreVertical } from "lucide-react";

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["coupons", page],
    queryFn: () => api.get<any>(`/admin/coupons?skip=${(page - 1) * 20}&take=20`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate(id);
    }
  };

  const openNewModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Coupons & Promotions</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Manage discount codes and promotional campaigns.</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
            <thead className="bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Validity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-primary)]">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--color-text-tertiary)]">Loading coupons...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--color-text-tertiary)]">No coupons found. Create your first campaign!</td></tr>
              ) : (
                data?.data?.map((coupon: any) => (
                  <tr key={coupon.id} className="hover:bg-[var(--color-bg-muted)]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[var(--color-text-primary)]">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-[var(--color-accent)]" /> {coupon.code}
                      </div>
                      <div className="text-xs font-sans font-normal text-[var(--color-text-secondary)] mt-0.5">{coupon.description || "No description"}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      {coupon.maxDiscount && <div className="text-xs text-[var(--color-text-tertiary)] font-normal">Up to ₹{coupon.maxDiscount}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "used"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {coupon.startDate || coupon.endDate ? (
                        <div className="flex flex-col gap-1 text-[var(--color-text-secondary)]">
                          {coupon.startDate && <span>From: {new Date(coupon.startDate).toLocaleDateString()}</span>}
                          {coupon.endDate && <span>To: {new Date(coupon.endDate).toLocaleDateString()}</span>}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-tertiary)]">Forever</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(coupon)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-bg-muted)]">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function CouponModal({ coupon, onClose }: { coupon?: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    description: coupon?.description || "",
    discountType: coupon?.discountType || "PERCENTAGE",
    discountValue: coupon?.discountValue || "",
    minOrderValue: coupon?.minOrderValue || "",
    maxDiscount: coupon?.maxDiscount || "",
    usageLimit: coupon?.usageLimit || "",
    startDate: coupon?.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : "",
    endDate: coupon?.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : "",
    isActive: coupon?.isActive ?? true,
    storeId: coupon?.storeId || "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => 
      coupon ? api.put(`/admin/coupons/${coupon.id}`, data) : api.post("/admin/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : null,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      storeId: formData.storeId || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--color-bg-surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {coupon ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Coupon Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm focus:border-[var(--color-primary)] font-mono uppercase" placeholder="SUMMER50" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Status</label>
                <select value={formData.isActive ? "true" : "false"} onChange={e => setFormData({...formData, isActive: e.target.value === "true"})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" placeholder="e.g., Summer sale flat 50% off" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Discount Type</label>
                <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Discount Value</label>
                <input required type="number" min="0" step="0.01" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" placeholder={formData.discountType === "PERCENTAGE" ? "20" : "500"} />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Min. Order Value (Optional)</label>
                <input type="number" min="0" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" placeholder="e.g., 999" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Max Discount (Optional)</label>
                <input type="number" min="0" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} disabled={formData.discountType === "FIXED_AMOUNT"} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm disabled:bg-[var(--color-bg-muted)] disabled:opacity-50" placeholder="e.g., 2000" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Usage Limit (Optional)</label>
                <input type="number" min="1" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" placeholder="e.g., 100 uses total" />
              </div>
              <div className="col-span-2 md:col-span-1"></div>

              <div className="col-span-2 border-t border-[var(--color-border)] pt-4 mt-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><Calendar size={16} /> Validity Period</h3>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Start Date (Optional)</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">End Date (Optional)</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" />
              </div>
            </div>
            
            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {(mutation.error as Error).message}
              </div>
            )}
          </form>
        </div>
        
        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/50 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors">
            Cancel
          </button>
          <button type="submit" form="coupon-form" disabled={mutation.isPending} className="rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-70">
            {mutation.isPending ? "Saving..." : "Save Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}
