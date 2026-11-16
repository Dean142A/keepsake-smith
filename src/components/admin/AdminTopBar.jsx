'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Plus, Upload, X, LogOut, ShieldCheck, Sparkles, User, ExternalLink } from 'lucide-react';

export default function AdminTopBar({
  pageTitle,
  searchTerm,
  setSearchTerm,
  onOpenAddOrder,
  onOpenCsvModal,
  onOpenMobileMenu,
  onLogout,
  user,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[64px] md:h-[72px] bg-white dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-30 transition-colors">
      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <h1 className="font-semibold text-base md:text-xl m-0 whitespace-nowrap truncate tracking-[-0.025em] text-neutral-900 dark:text-white">
          {pageTitle}
        </h1>

        {/* Global Search Bar (TeleFlow Style) */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
          <input
            type="text"
            placeholder="Search orders, codes, recipients... (⌘K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-transparent bg-neutral-100/80 dark:bg-neutral-800/80 px-4 pl-9 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent focus:bg-white dark:focus:bg-neutral-900 transition-all text-neutral-900 dark:text-neutral-100"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Quick Action Button */}
        {onOpenAddOrder && (
          <button
            onClick={onOpenAddOrder}
            className="primary-button text-xs btn-press hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3.5"
          >
            <Plus size={14} />
            <span>New Gift Order</span>
          </button>
        )}

        {/* CSV Import Shortcut */}
        {onOpenCsvModal && (
          <button
            onClick={onOpenCsvModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all btn-press"
          >
            <Upload size={13} />
            <span>Daily CSV</span>
          </button>
        )}

        {/* Live Customer Portal Preview Link */}
        <a
          href="https://app.thekeepsakesmith.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-accent bg-accent-soft hover:opacity-90 transition-all"
        >
          <span>3D Portal</span>
          <ExternalLink size={12} />
        </a>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full relative transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[280px] bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl shadow-lg p-3 z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span>System Notifications</span>
                <span className="text-[10px] text-accent font-normal">Active</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="font-medium text-neutral-900 dark:text-white block">
                    Magic Containers Active
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    app. & admin. endpoints healthy on Bunny CDN.
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="font-medium text-neutral-900 dark:text-white block">
                    Access Code Engine
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Automatic KPSK-XXXX-XXXX generation ready.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors btn-press"
          >
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-[230px] bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden z-50 animate-scale-in">
              <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                  {user?.username || 'admin@thekeepsakesmith.com'}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Master Administrator</div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-accent-soft text-accent rounded-full text-[9px] font-semibold uppercase tracking-[0.05em]">
                  <ShieldCheck size={10} />
                  <span>Verified Session</span>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
