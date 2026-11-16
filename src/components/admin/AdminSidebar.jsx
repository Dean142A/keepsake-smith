'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Key,
  Layers,
  Settings,
  Moon,
  Sun,
  Package,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', name: 'Orders & Gifts', icon: Users },
  { id: 'create', name: 'New Order / CSV', icon: UserPlus },
  { id: 'vault', name: 'Access Codes', icon: Key },
  { id: 'catalog', name: 'Catalog & 3D Covers', icon: Layers },
  { id: 'settings', name: 'Settings & Security', icon: Settings },
];

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  onLogout,
  onNavClick,
  user,
}) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#101217] border-r border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800/60 mb-2">
        <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-accent flex-shrink-0 shadow-xs">
          <Package size={19} />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-sm tracking-[-0.03em] block truncate leading-tight text-neutral-900 dark:text-white">
            Keepsake Ops
          </span>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.08em] block mt-0.5 font-mono">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onNavClick) onNavClick();
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all duration-200 text-sm w-full text-left btn-press ${
                isActive
                  ? 'text-accent bg-accent-soft font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-normal'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-accent' : 'opacity-70'} />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logged in User Card */}
      <div className="px-3 pb-2">
        <div className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/40 dark:border-neutral-800 rounded-xl text-center">
          <span className="uppercase font-medium text-[9px] text-neutral-400 block tracking-[0.08em]">
            Logged in as
          </span>
          <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 mt-0.5 truncate">
            {user?.username || 'admin@thekeepsakesmith.com'}
          </div>
          <div className="text-[10px] mt-0.5 font-medium text-accent">Super Admin</div>
        </div>
      </div>

      {/* Bottom Actions: Theme Toggle & Logout */}
      <div className="p-3 pt-1 space-y-1 border-t border-neutral-100 dark:border-neutral-800/60">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3.5 py-2 rounded-full transition-all duration-200 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 w-full btn-press"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-full transition-all duration-200 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full btn-press"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

