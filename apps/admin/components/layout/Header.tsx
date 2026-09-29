"use client";

import { Bell, Search, LogOut, User, Settings, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useRouter } from "next/navigation";
import { MenuDropdown } from "@/components/ui/Dropdown";

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleMobileSidebar } = useUiStore();
  const router = useRouter();

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "A";

  const handleUserAction = async (value: string) => {
    if (value === "logout") {
      await logout();
      router.replace("/login");
    } else if (value === "settings") {
      router.push("/settings");
    } else if (value === "profile") {
      router.push("/settings");
    }
  };

  return (
    <header
      style={{ height: "var(--header-height)" }}
      className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 sm:px-6"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)] transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] w-48 lg:w-64 cursor-pointer hover:border-[var(--color-border-strong)] transition-colors">
          <Search size={14} />
          <span className="text-[var(--color-text-tertiary)]">Search...</span>
          <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">⌘K</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)] transition-colors">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
        </button>

        {/* User Menu */}
        <MenuDropdown
          trigger={
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-base)] px-2 py-1 transition-colors cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold">
                {initials}
              </div>
              {user && (
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] leading-none truncate max-w-[100px]">
                    {user.fullName ?? user.email}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] leading-none mt-0.5 capitalize">
                    {user.role === "SUPER_ADMIN" ? "Super Admin" : "Manager"}
                  </p>
                </div>
              )}
            </div>
          }
          items={[
            { value: "profile", label: "My Profile", icon: <User size={14} /> },
            { value: "settings", label: "Settings", icon: <Settings size={14} /> },
            { value: "logout", label: "Sign out", icon: <LogOut size={14} />, danger: true },
          ]}
          onSelect={handleUserAction}
          align="right"
        />
      </div>
    </header>
  );
}
