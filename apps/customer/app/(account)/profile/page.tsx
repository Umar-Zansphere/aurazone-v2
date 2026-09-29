"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { User, Mail, Shield, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setFullName(user.fullName ?? "");
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put("/users/profile", { fullName });
      await fetchUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-6">
      {/* Avatar Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white text-2xl font-bold shadow-[var(--shadow-md)]">
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-primary)] text-white shadow-sm hover:opacity-80 transition-opacity">
            <Camera size={12} />
          </button>
        </div>
        <div className="text-center sm:text-left min-w-0">
          <p className="text-xl font-bold text-[var(--color-text-primary)] truncate">{user?.fullName ?? "My Account"}</p>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)] truncate">{user?.email}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-light)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
            <Shield size={11} />
            {user?.role === "SUPER_ADMIN" ? "Super Admin" : user?.role === "STORE_MANAGER" ? "Manager" : "Customer"}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              <User size={11} /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              <Mail size={11} /> Email Address
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2.5 text-sm text-[var(--color-text-tertiary)] cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">Email cannot be changed.</p>
          </div>

          {error && (
            <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-1">
            {saved && (
              <span className="text-xs font-medium text-emerald-600">✓ Profile saved successfully!</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto ml-auto rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}