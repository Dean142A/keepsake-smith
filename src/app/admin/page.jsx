'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastProvider, useToast } from '@/components/admin/AdminToast';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar, { ADMIN_NAV_ITEMS } from '@/components/admin/AdminSidebar';
import { Menu } from 'lucide-react';
import AdminRecentPanel from '@/components/admin/AdminRecentPanel';
import AdminCommandBar from '@/components/admin/AdminCommandBar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminCreateOrder from '@/components/admin/AdminCreateOrder';
import AdminCodeVault from '@/components/admin/AdminCodeVault';
import AdminCatalog from '@/components/admin/AdminCatalog';
import AdminSettings from '@/components/admin/AdminSettings';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';

const STORAGE_DARK = 'keepsake_admin_dark_mode';
const STORAGE_ACCENT = 'keepsake_admin_accent';

/** Keepsake gold — the console's default accent. */
// The reference has no coloured accent: the primary is near-black and
// everything else is greyscale. Sampled from the 'Create new chat' button.
const DEFAULT_ACCENT = '#0b151d';

/** Shift a hex colour lighter (positive) or darker (negative). */
function adjustColor(hex, amount) {
  let c = String(hex).replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgba(hex, alpha) {
  let c = String(hex).replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return `rgba(197, 160, 89, ${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function AdminPortalInner({
  darkMode,
  setDarkMode,
  accentColor,
  setAccentColor,
}) {
  const { toast } = useToast();

  // ── Auth ──────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser] = useState({
    username: 'admin@thekeepsakesmith.com',
    role: 'Super Admin',
  });

  // ── Navigation ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFilters, setSearchFilters] = useState({ status: 'all', fulfillmentType: 'all', recent: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // ── Modals ────────────────────────────────────────────────────────────
  const [viewingOrder, setViewingOrder] = useState(null);

  // Verify the server session on mount.
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      setIsAuthenticated(Boolean(data && data.authenticated));
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
      toast('Could not load admin data', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      window.localStorage.setItem(STORAGE_DARK, String(next));
    } catch { /* ignore */ }
    toast(next ? 'Switched to obsidian theme' : 'Switched to light theme');
  };

  const handleChangeAccent = (color) => {
    setAccentColor(color);
    try {
      window.localStorage.setItem(STORAGE_ACCENT, color);
    } catch { /* ignore */ }
    toast('Accent updated');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch { /* ignore */ }
    setIsAuthenticated(false);
    toast('Signed out');
  };

  const handleSaveAssets = async (orderId, assets) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, ...assets }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save assets');
    setViewingOrder(data.order);
    fetchData();
    return data;
  };

  // Re-sends the notification for the stage the order is already at. POST
  // creates a new order, so sending through it never reached the mailer.
  // Moves the order to a fulfilment stage, which is what triggers the
  // recipient and purchaser notifications for that stage.
  const handleUpdateOrder = async (orderId, patch) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, ...patch }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update the order');
    fetchData();
    return data;
  };

  // The access code goes with the id so a request carrying only an id can
  // never delete a customer's keepsake by accident.
  const handleDeleteOrder = async (orderId, accessCode) => {
    const res = await fetch('/api/admin/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, accessCode }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete the order');
    fetchData();
    return data;
  };

  const handleSetStage = async (orderId, stage) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: stage }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update the order');
    fetchData();
    return data;
  };

  const handleSendEmail = async (orderId, status) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: status || 'ready', sendNotification: true }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to send notification email');
    if (!data.emailSent) {
      const reason = (data.deliveries || []).map((d) => d.error).filter(Boolean)[0];
      throw new Error(reason || 'The mail provider did not accept the message');
    }
    fetchData();
    return data;
  };

  // ⌘K / Ctrl+K focuses the global search field.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-global-search')?.focus();
      }
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // One filtered list, shared by the bar that sets it and the panel that
  // shows it, so the count beside the bar is never out of step.
  const filteredOrders = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return orders.filter((o) => {
      if (q) {
        const hay = [o.recipientName, o.purchaserName, o.accessCode, o.id, o.recipientEmail, o.purchaserEmail]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (searchFilters.status && searchFilters.status !== 'all' && o.status !== searchFilters.status) return false;
      if (
        searchFilters.fulfillmentType &&
        searchFilters.fulfillmentType !== 'all' &&
        (o.fulfillmentType || 'digital_physical') !== searchFilters.fulfillmentType
      ) return false;
      if (searchFilters.recent && new Date(o.createdAt || 0).getTime() < weekAgo) return false;
      return true;
    });
  }, [orders, globalSearch, searchFilters]);

  // "admin@thekeepsakesmith.com" is not a name. The reference greets a
  // person, so take the local part and title-case it.
  const displayName = useMemo(() => {
    const raw = (currentUser?.username || '').trim();
    if (!raw) return 'Administrator';
    const local = raw.split('@')[0].replace(/[._-]+/g, ' ').trim();
    if (!local) return 'Administrator';
    return local.charAt(0).toUpperCase() + local.slice(1);
  }, [currentUser]);

  const currentNav =
    ADMIN_NAV_ITEMS.find((n) => n.id === activeTab) || ADMIN_NAV_ITEMS[0];

  let body;

  if (authChecking) {
    body = (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="uppercase-label text-accent block">
            Verifying admin session…
          </span>
        </div>
      </div>
    );
  } else if (!isAuthenticated) {
    body = (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          fetchData();
          toast('Welcome to Keepsake Ops');
        }}
      />
    );
  } else {
    body = (
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans transition-colors">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-[280px] flex-shrink-0 flex-col z-20 border-r hairline">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
            user={currentUser}
          />
        </aside>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-neutral-950/60"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-[280px] flex flex-col z-10 animate-slide-up">
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

        {/* Main viewport. The reference has no top bar: the brand lives in
            the sidebar and search lives in the bar at the foot of the centre
            column. Only the mobile trigger survives, since the reference is
            a desktop shot and a phone still needs a way to the nav. */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            <div className="md:hidden flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center btn-press"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <span className="font-semibold text-[15px]">{currentNav.name}</span>
            </div>

            <main className="flex-1 overflow-y-auto px-5 md:px-10 pb-4">
              <div className="max-w-[880px] mx-auto w-full">
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  userName={displayName}
                  orders={orders}
                  onOpenOrder={setViewingOrder}
                  onOpenAddOrder={() => setActiveTab('create')}
                  onOpenCsvModal={() => setActiveTab('create')}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrders
                  orders={orders}
                  onOpenOrder={setViewingOrder}
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
                <AdminCodeVault orders={orders} onOpenOrder={setViewingOrder} />
              )}

              {activeTab === 'catalog' && (
                <AdminCatalog products={products} onRefresh={fetchData} />
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

            {/* The bar the reference pins to the foot of the centre column. */}
            <div className="px-5 md:px-10 pb-5 md:pb-8">
              <div className="max-w-[880px] mx-auto w-full">
                <AdminCommandBar
                  value={globalSearch}
                  onChange={setGlobalSearch}
                  filters={searchFilters}
                  onFilters={setSearchFilters}
                  resultCount={filteredOrders.length}
                />
              </div>
            </div>
          </div>

          {/* Right-hand panel, as in the reference */}
          <aside className="hidden xl:flex w-[340px] flex-shrink-0 py-5 pr-5">
            <AdminRecentPanel
              orders={filteredOrders}
              onOpenOrder={setViewingOrder}
              onNewOrder={() => setActiveTab('create')}
              onRefresh={fetchData}
            />
          </aside>
        </div>

        <OrderDetailsModal
          order={viewingOrder}
          isOpen={Boolean(viewingOrder)}
          onClose={() => setViewingOrder(null)}
          onSaveAssets={handleSaveAssets}
          onSendEmail={handleSendEmail}
          onSetStage={handleSetStage}
          onUpdateOrder={handleUpdateOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      </div>
    );
  }

  return body;
}

export default function AdminPage() {
  // Theme state lives above ToastProvider on purpose: the provider renders its
  // toast stack as a sibling of `children`, so anything that must inherit
  // `.admin-root` or `.dark` has to be wrapped further out than the provider.
  //
  // Dark-first, matching the obsidian storefront. The initial value is
  // deterministic so SSR and the first client render agree; the saved
  // preference is applied after mount.
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    try {
      const savedDark = window.localStorage.getItem(STORAGE_DARK);
      const savedAccent = window.localStorage.getItem(STORAGE_ACCENT);
      if (savedDark !== null) setDarkMode(savedDark === 'true');
      if (savedAccent) setAccentColor(savedAccent);
    } catch {
      /* localStorage unavailable (private mode) — keep the defaults. */
    }
  }, []);

  /**
   * Accent tokens are set inline on the console root so they cascade to every
   * child and stay scoped to /admin. `--accent-light-text` is shifted toward
   * the readable end of the hue for the active theme, keeping `.text-accent`
   * legible on both obsidian and paper surfaces.
   */

  // `.admin-root` scopes the stylesheet's reset; `.dark` drives every `dark:`
  // variant beneath it. Keeping both here rather than on <html> is what stops
  // the admin theme from reaching the storefront.
  return (
    <div
      className={`admin-root${darkMode ? ' dark' : ''}`}
    >
      <ToastProvider>
        <AdminPortalInner
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />
      </ToastProvider>
    </div>
  );
}
