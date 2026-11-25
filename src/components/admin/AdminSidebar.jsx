'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Key,
  Layers,
  Settings,
  ChevronUp,
  Sun,
  Moon,
  LogOut,
  Package,
} from 'lucide-react';

/**
 * Primary navigation. The reference groups a couple of secondary
 * destinations under a collapsible heading rather than running one flat
 * list, so the two that are not part of the daily order flow sit there.
 */
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', name: 'Orders & Gifts', icon: Users },
  { id: 'create', name: 'New Order / CSV', icon: UserPlus },
  { id: 'vault', name: 'Access Codes', icon: Key },
  { id: 'catalog', name: 'Templates', icon: Layers, soon: true },
  { id: 'settings', name: 'Settings', icon: Settings },
];

const PRIMARY = ADMIN_NAV_ITEMS.slice(0, 4);
const SECONDARY = ADMIN_NAV_ITEMS.slice(4);

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  onLogout,
  onNavClick,
  user,
}) {
  const [groupOpen, setGroupOpen] = useState(true);

  const go = (id) => {
    setActiveTab(id);
    if (onNavClick) onNavClick();
  };

  const navRow = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => go(item.id)}
        className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full w-full text-left text-[15px] transition-all duration-150 ${
          isActive
            ? 'active-nav-item'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/70 dark:hover:bg-neutral-800/60'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon
          size={19}
          strokeWidth={isActive ? 2.2 : 1.8}
          className={isActive ? 'text-neutral-950 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}
        />
        <span className="truncate">{item.name}</span>
        {item.soon && (
          <span className="ml-auto flex-shrink-0 px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
            Soon
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 select-none">
      {/* Brand */}
      <div className="px-6 pt-7 pb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center flex-shrink-0">
          <Package size={17} className="text-white dark:text-neutral-950" strokeWidth={2.2} />
        </div>
        <span className="font-semibold text-[19px] tracking-[-0.02em] truncate">
          Keepsake
        </span>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto" aria-label="Main navigation">
        <div className="space-y-1.5">{PRIMARY.map(navRow)}</div>

        <button
          onClick={() => setGroupOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 pt-9 pb-3 text-[15px] font-semibold text-neutral-900 dark:text-neutral-100"
          aria-expanded={groupOpen}
        >
          <span>Catalogue</span>
          <ChevronUp
            size={17}
            className={`text-neutral-400 transition-transform duration-200 ${groupOpen ? '' : 'rotate-180'}`}
          />
        </button>

        {groupOpen && <div className="space-y-1.5">{SECONDARY.map(navRow)}</div>}
      </nav>

      {/* Account card, as in the reference: identity above a dark pill */}
      <div className="p-4">
        <div className="rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/70 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 text-xs font-semibold">
                {(user?.username || 'AD').slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-neutral-200/70 dark:ring-neutral-800" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold leading-tight truncate">
                {user?.username || 'Administrator'}
              </div>
              <div className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate">
                {user?.role || 'Super Admin'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="primary-button flex-1 text-[13px] py-2.5 btn-press"
            ><span>Sign Out</span>
            </button>
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Light theme' : 'Dark theme'}
              className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 flex items-center justify-center flex-shrink-0 btn-press"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
