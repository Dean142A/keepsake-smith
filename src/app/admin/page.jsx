'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from '@/components/admin/AdminToast';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar, { ADMIN_NAV_ITEMS } from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminCreateOrder from '@/components/admin/AdminCreateOrder';
import AdminCodeVault from '@/components/admin/AdminCodeVault';
import AdminCatalog from '@/components/admin/AdminCatalog';
import AdminSettings from '@/components/admin/AdminSettings';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

function AdminPortalInner() {
  const { toast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState({ username: 'admin@thekeepsakesmith.com', role: 'Super Admin' });

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme & Styling State
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState('#10b981'); // TeleFlow Emerald default

  // Data State
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modal State
  const [viewingOrder, setViewingOrder] = useState(null);

  // 1. Check server session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      if (data && data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // 2. Fetch admin data
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [resOrders, resProducts] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
      ]);

      const dataOrders = await resOrders.json().catch(() => ({ orders: [] }));
      const dataProducts = await resProducts.json().catch(() => ({ products: [] }));

      if (dataOrders.success) setOrders(dataOrders.orders || []);
      if (dataProducts.success) setProducts(dataProducts.products || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // 3. Theme & Accent Syncing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDark = localStorage.getItem('tf_dark_mode') === 'true';
      const savedAccent = localStorage.getItem('tf_accent_color') || '#10b981';
      setDarkMode(savedDark);
      setAccentColor(savedAccent);
      applyTheme(savedDark, savedAccent);
    }
  }, []);

  const applyTheme = (isDark, color) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.style.setProperty('--accent', color);
      root.style.setProperty('--accent-hover', adjustColor(color, -20));
      root.style.setProperty('--accent-light', hexToRgba(color, 0.12));
    }
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tf_dark_mode', String(nextDark));
    }
    applyTheme(nextDark, accentColor);
    toast(nextDark ? 'Switched to Dark Theme' : 'Switched to Light Theme');
  };

  const handleChangeAccent = (color) => {
    setAccentColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tf_accent_color', color);
    }
    applyTheme(darkMode, color);
    toast('Accent theme updated');
  };

  // Helper color adjusters
  function adjustColor(hex, percent) {
    let num = parseInt(hex.replace('#', ''), 16);
    let r = Math.min(255, Math.max(0, (num >> 16) + percent));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    let b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    let num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  // 4. Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {}
    setIsAuthenticated(false);
    toast('Logged out successfully');
  };

  // 5. Save 3D Production Assets Handler
  const handleSaveAssets = async (orderId, assets) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        ...assets,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setViewingOrder(data.order);
      fetchData();
      return data;
    } else {
      throw new Error(data.error || 'Failed to save assets');
    }
  };

  // 6. Send Notification Email Handler
  const handleSendEmail = async (orderId) => {
    const res = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notifyRecipient: true,
        orderId,
      }),
    });
    const data = await res.json();
    if (data.success) {
      fetchData();
      return data;
    } else {
      throw new Error(data.error || 'Failed to send notification email');
    }
  };

  // Keyboard shortcut (⌘K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="(⌘K)"]');
        if (searchInput) searchInput.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // RENDER: SESSION LOADING
  // ─────────────────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="uppercase font-medium text-[11px] tracking-[0.1em] text-accent block">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: TELEFLOW LOGIN GATE
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          fetchData();
          toast('Welcome to Keepsake Ops');
        }}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: AUTHENTICATED TELEFLOW APP LAYOUT
  // ─────────────────────────────────────────────────────────────
  const currentNav = ADMIN_NAV_ITEMS.find((n) => n.id === activeTab) || ADMIN_NAV_ITEMS[0];

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans transition-colors">
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-[210px] flex-shrink-0 flex-col z-20">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          user={currentUser}
        />
      </aside>

      {/* 2. Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] flex flex-col z-10 animate-slide-up">
            <AdminSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onLogout={handleLogout}
              onNavClick={() => setMobileMenuOpen(false)}
              user={currentUser}
            />
          </aside>
        </div>
      )}

      {/* 3. Main Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TopBar */}
        <AdminTopBar
          pageTitle={currentNav.name}
          searchTerm={globalSearch}
          setSearchTerm={setGlobalSearch}
          onOpenAddOrder={() => setActiveTab('create')}
          onOpenCsvModal={() => setActiveTab('create')}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
          user={currentUser}
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <AdminDashboard
                orders={orders}
                onOpenOrder={(ord) => setViewingOrder(ord)}
                onOpenAddOrder={() => setActiveTab('create')}
                onOpenCsvModal={() => setActiveTab('create')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrders
                orders={orders}
                onOpenOrder={(ord) => setViewingOrder(ord)}
                onOpenAddOrder={() => setActiveTab('create')}
                globalSearch={globalSearch}
              />
            )}

            {activeTab === 'create' && (
              <AdminCreateOrder
                onOrderCreated={() => {
                  fetchData();
                  setActiveTab('orders');
                }}
                onBatchImported={() => {
                  fetchData();
                  setActiveTab('orders');
                }}
              />
            )}

            {activeTab === 'vault' && (
              <AdminCodeVault
                orders={orders}
                onOpenOrder={(ord) => setViewingOrder(ord)}
              />
            )}

            {activeTab === 'catalog' && (
              <AdminCatalog
                products={products}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettings
                currentAccent={accentColor}
                onChangeAccent={handleChangeAccent}
                user={currentUser}
              />
            )}
          </div>
        </main>
      </div>

      {/* 4. Order Details Modal */}
      <OrderDetailsModal
        order={viewingOrder}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onSaveAssets={handleSaveAssets}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminPortalInner />
    </ToastProvider>
  );
}
