'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Package, RefreshCw, Key, Mail, Lock, LogOut, ShieldCheck, Search, Filter, Upload, Image as ImageIcon, Link as LinkIcon, X, Eye, Copy, Check } from 'lucide-react';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL', 'PHYSICAL', 'DIGITAL', 'GIFTS'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Order Details Modal State
  const [viewingOrder, setViewingOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('CARDS');
  const [image, setImage] = useState('');
  const [allowsCustomization, setAllowsCustomization] = useState(true);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);

  // Categories Manager State
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Live Timer Settings State
  const [timerHours, setTimerHours] = useState(22);
  const [timerMinutes, setTimerMinutes] = useState(7);
  const [timerSeconds, setTimerSeconds] = useState(46);
  const [savingTimer, setSavingTimer] = useState(false);

  // Check login session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const authSession = sessionStorage.getItem('ks_admin_auth') || localStorage.getItem('ks_admin_auth');
        if (authSession === 'true') {
          setIsAuthenticated(true);
        }
      } catch (err) {}
    }
  }, []);

  const handleLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanPass = (password || '').trim().toLowerCase();
    if (cleanPass === 'keepsake2026' || cleanPass === 'admin' || cleanPass === 'keepsake') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('ks_admin_auth', 'true');
          localStorage.setItem('ks_admin_auth', 'true');
        } catch (err) {}
      }
      setLoginError('');
    } else {
      setLoginError('Invalid Admin Passcode. Password is "keepsake2026".');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('ks_admin_auth');
        localStorage.removeItem('ks_admin_auth');
      } catch (err) {}
    }
    setPassword('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resOrd, resCat, resTimer] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/settings'),
      ]);
      const dataProd = await resProd.json();
      const dataOrd = await resOrd.json();
      const dataCat = await resCat.json();
      const dataTimer = await resTimer.json();

      if (dataProd.success) setProducts(dataProd.products || []);
      if (dataOrd.success) setOrders(dataOrd.orders || []);
      if (dataCat.success) setCategories(dataCat.categories || []);
      if (dataTimer.success && dataTimer.settings) {
        setTimerHours(dataTimer.settings.timerHours ?? 22);
        setTimerMinutes(dataTimer.settings.timerMinutes ?? 7);
        setTimerSeconds(dataTimer.settings.timerSeconds ?? 46);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimerSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingTimer(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timerHours: Number(timerHours),
          timerMinutes: Number(timerMinutes),
          timerSeconds: Number(timerSeconds),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Live Homepage Countdown Timer updated and saved to database!');
      } else {
        setStatusMsg('Error: ' + (data.error || 'Failed to update timer settings.'));
      }
    } catch (err) {
      setStatusMsg('Network error updating timer settings.');
    } finally {
      setSavingTimer(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setPrice('');
    setCategory('CARDS');
    setImage('');
    setAllowsCustomization(true);
    setEditingProduct(null);
    setUploadError('');
    setUploading(false);
    setUseUrlInput(false);
    setIsFormOpen(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImage(data.url || data.dataUrl);
      } else {
        setUploadError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadError('Server error uploading image file.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setSubtitle(prod.subtitle || '');
    setPrice(prod.price);
    setCategory(prod.category || 'CARDS');
    setImage(prod.image || '');
    setAllowsCustomization(prod.allowsCustomization !== false);
    setIsFormOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price) {
      setStatusMsg('Title and Price are required.');
      return;
    }

    const payload = {
      title,
      subtitle,
      price: Number(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      allowsCustomization,
    };

    try {
      if (editingProduct) {
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg('Product updated successfully!');
          fetchData();
          resetForm();
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg('New product created successfully!');
          fetchData();
          resetForm();
        }
      }
    } catch (err) {
      setStatusMsg('Server error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
        setStatusMsg('Product deleted successfully.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // CATEGORY MANAGEMENT HANDLERS
  const resetCategoryForm = () => {
    setCatName('');
    setCatDescription('');
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName || !catName.trim()) {
      setStatusMsg('Category name is required.');
      return;
    }

    const payload = {
      name: catName.trim().toUpperCase(),
      description: catDescription.trim(),
    };

    try {
      if (editingCategory) {
        const res = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...payload }),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg(`Category "${data.category.name}" updated successfully!`);
          fetchData();
          resetCategoryForm();
        } else {
          setStatusMsg(data.error || 'Error updating category');
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg(`New category "${data.category.name}" created successfully!`);
          fetchData();
          resetCategoryForm();
        } else {
          setStatusMsg(data.error || 'Error creating category');
        }
      }
    } catch (err) {
      setStatusMsg('Server error saving category.');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Category "${name}" deleted.`);
        fetchData();
      } else {
        setStatusMsg(data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleOrderStatusToggle = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(
          newStatus === 'ready'
            ? `Order #${orderId} marked READY & notification email sent!`
            : `Order #${orderId} status updated to ${newStatus}.`
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleSendNotification = async (orderId) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'ready', sendNotification: true }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Email notification sent to recipient for Order #${orderId}!`);
        fetchData();
      }
    } catch (err) {
      console.error('Error sending email notification:', err);
    }
  };

  // 1. LOGIN SCREEN (IF UNAUTHENTICATED)
  if (!isAuthenticated) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          {/* Logo Emblem */}
          <div style={styles.loginLogo}>
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
              <path d="M50 15 C30 15, 15 30, 15 50 C15 70, 30 85, 50 85" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            <h1 style={styles.loginTitle}>THE KEEPSAKE SMITH</h1>
            <span style={styles.loginSub}>ADMIN CMS LOGIN</span>
          </div>

          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Admin Security Passcode</label>
              <div style={styles.inputWrap}>
                <Lock size={16} color="#888" style={{ marginLeft: '12px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }}
                  placeholder="Enter passcode (keepsake2026)"
                  style={styles.passwordInput}
                  required
                  autoFocus
                />
              </div>
            </div>

            {loginError && <div style={styles.errorAlert}>{loginError}</div>}

            <button
              type="submit"
              onClick={handleLogin}
              style={styles.loginBtn}
            >
              Unlock Dashboard
            </button>
          </form>

          <p style={styles.hintText}>Protected system portal. Default access passcode: <code>keepsake2026</code></p>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div style={styles.adminPage}>
      {/* DEDICATED ADMIN HEADER (Independent from Storefront) */}
      <header style={styles.adminNavHeader}>
        <div className="admin-container" style={styles.adminHeaderRow}>
          <div style={styles.brandGroup}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
              <path d="M50 15 C30 15, 15 30, 15 50 C15 70, 30 85, 50 85" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            <div>
              <div style={styles.brandTitle}>THE KEEPSAKE SMITH</div>
              <div style={styles.subdomainLabel}>admin.thekeepsakesmith.com</div>
            </div>
          </div>

          {/* Center Tab Buttons */}
          <div style={styles.navTabs}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                ...styles.navTabBtn,
                color: activeTab === 'orders' ? '#FFFFFF' : '#888888',
                borderBottom: activeTab === 'orders' ? '2px solid #C5A059' : '2px solid transparent',
              }}
            >
              Orders CRM ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                ...styles.navTabBtn,
                color: activeTab === 'products' ? '#FFFFFF' : '#888888',
                borderBottom: activeTab === 'products' ? '2px solid #C5A059' : '2px solid transparent',
              }}
            >
              Product Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              style={{
                ...styles.navTabBtn,
                color: activeTab === 'categories' ? '#FFFFFF' : '#888888',
                borderBottom: activeTab === 'categories' ? '2px solid #C5A059' : '2px solid transparent',
              }}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              style={{
                ...styles.navTabBtn,
                color: activeTab === 'timer' ? '#FFFFFF' : '#888888',
                borderBottom: activeTab === 'timer' ? '2px solid #C5A059' : '2px solid transparent',
              }}
            >
              Timer Settings
            </button>
          </div>

          {/* Right Action Group */}
          <div style={styles.rightActions}>
            {activeTab === 'products' && (
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#C5A059',
                  color: '#000',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add Product
              </button>
            )}

            {activeTab === 'categories' && (
              <button
                onClick={() => {
                  resetCategoryForm();
                  setIsCategoryModalOpen(true);
                }}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#C5A059',
                  color: '#000',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add Category
              </button>
            )}

            <button
              onClick={fetchData}
              className="btn-pill"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={handleLogout}
              className="btn-pill btn-pill-dark"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container" style={styles.mainContent}>
        {/* Status Alert Message */}
        {statusMsg && (
          <div style={styles.alertBanner} onClick={() => setStatusMsg('')}>
            <span>{statusMsg}</span>
            <span style={{ cursor: 'pointer', opacity: 0.8 }}>✕</span>
          </div>
        )}

        {/* ORDERS CRM QUEUE TAB */}
        {activeTab === 'orders' && (
          <div>
            <div style={styles.pageTitleRow}>
              <div>
                <h1 style={styles.headingTitle}>Orders Queue & Access Codes CRM</h1>
                <p style={styles.headingSub}>Classify physical card shipments vs digital 3D portal orders, manage access codes & fulfillment</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Revenue</span>
                <span style={styles.statVal}>
                  NGN {orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString()}
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Orders</span>
                <span style={styles.statVal}>{orders.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>3D Portal Redemption Rate</span>
                <span style={styles.statVal}>
                  {orders.length > 0
                    ? `${Math.round((orders.filter((o) => o.redeemed || o.status === 'redeemed' || o.redemptionCount > 0).length / orders.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Physical Cards / Gift Boxes</span>
                <span style={styles.statVal}>{orders.filter((o) => o.fulfillmentType === 'physical_card').length}</span>
              </div>
            </div>

            {/* Fulfillment Filter Pills */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setOrderFilter('ALL')}
                style={{
                  ...styles.filterPill,
                  backgroundColor: orderFilter === 'ALL' ? '#C5A059' : 'rgba(255, 255, 255, 0.05)',
                  color: orderFilter === 'ALL' ? '#000' : '#FFF',
                  borderColor: orderFilter === 'ALL' ? '#C5A059' : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('PHYSICAL')}
                style={{
                  ...styles.filterPill,
                  backgroundColor: orderFilter === 'PHYSICAL' ? '#C5A059' : 'rgba(255, 255, 255, 0.05)',
                  color: orderFilter === 'PHYSICAL' ? '#000' : '#FFF',
                  borderColor: orderFilter === 'PHYSICAL' ? '#C5A059' : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                Physical Cards ({orders.filter((o) => o.fulfillmentType === 'physical_card').length})
              </button>
              <button
                onClick={() => setOrderFilter('DIGITAL')}
                style={{
                  ...styles.filterPill,
                  backgroundColor: orderFilter === 'DIGITAL' ? '#C5A059' : 'rgba(255, 255, 255, 0.05)',
                  color: orderFilter === 'DIGITAL' ? '#000' : '#FFF',
                  borderColor: orderFilter === 'DIGITAL' ? '#C5A059' : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                Digital 3D Portal ({orders.filter((o) => o.fulfillmentType === 'digital_only').length})
              </button>
              <button
                onClick={() => setOrderFilter('GIFTS')}
                style={{
                  ...styles.filterPill,
                  backgroundColor: orderFilter === 'GIFTS' ? '#C5A059' : 'rgba(255, 255, 255, 0.05)',
                  color: orderFilter === 'GIFTS' ? '#000' : '#FFF',
                  borderColor: orderFilter === 'GIFTS' ? '#C5A059' : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                Gifts ({orders.filter((o) => o.recipientType === 'gift').length})
              </button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={styles.th}>Order ID & Date</th>
                    <th style={styles.th}>Order Type</th>
                    <th style={styles.th}>Purchaser</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter((ord) => {
                    if (orderFilter === 'PHYSICAL') return ord.fulfillmentType === 'physical_card';
                    if (orderFilter === 'DIGITAL') return ord.fulfillmentType === 'digital_only';
                    if (orderFilter === 'GIFTS') return ord.recipientType === 'gift';
                    return true;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter((ord) => {
                        if (orderFilter === 'PHYSICAL') return ord.fulfillmentType === 'physical_card';
                        if (orderFilter === 'DIGITAL') return ord.fulfillmentType === 'digital_only';
                        if (orderFilter === 'GIFTS') return ord.recipientType === 'gift';
                        return true;
                      })
                      .map((ord) => (
                        <tr key={ord.id} style={styles.trBody}>
                          <td style={styles.td}>
                            <div style={{ color: '#FFF', fontWeight: '400', fontFamily: 'monospace' }}>#{ord.id}</div>
                            <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            {ord.fulfillmentType === 'physical_card' ? (
                              <span style={styles.physicalTag}>Physical Card</span>
                            ) : (
                              <span style={styles.digitalTag}>Digital Only</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            <div style={{ color: '#FFF', fontWeight: '400' }}>{ord.purchaserName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#888' }}>{ord.purchaserEmail}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#FFF', fontWeight: '400' }}>₦{ord.totalAmount.toLocaleString()}</span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusTag,
                                borderColor:
                                  ord.status === 'ready'
                                    ? '#66BB6A'
                                    : ord.status === 'in_production'
                                    ? '#C5A059'
                                    : '#888888',
                                color:
                                  ord.status === 'ready'
                                    ? '#66BB6A'
                                    : ord.status === 'in_production'
                                    ? '#C5A059'
                                    : '#888888',
                              }}
                            >
                              {ord.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button
                              onClick={() => setViewingOrder(ord)}
                              className="btn-pill"
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.4rem 0.9rem',
                                marginRight: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                              title="View Order Details"
                            >
                              <Eye size={13} /> View
                            </button>
                            {ord.status === 'in_production' && (
                              <button
                                onClick={() => handleOrderStatusToggle(ord.id, 'ready')}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.35rem 0.8rem',
                                  marginRight: '6px',
                                  backgroundColor: '#C5A059',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '9999px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Ready & Send Email
                              </button>
                            )}
                            <button
                              onClick={() => handleSendNotification(ord.id)}
                              style={styles.actionBtn}
                              title="Resend Email Notification"
                            >
                              <Mail size={16} color="#FFF" />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS CATALOG TAB */}
        {activeTab === 'products' && (
          <div>
            <div style={styles.pageTitleRow}>
              <div>
                <h1 style={styles.headingTitle}>Product Catalog CMS</h1>
                <p style={styles.headingSub}>Add, edit, or customize product listings, pricing, and custom order flags</p>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Catalog Products</span>
                <span style={styles.statVal}>{products.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Customizable Products</span>
                <span style={styles.statVal}>{products.filter((p) => p.allowsCustomization).length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Database Status</span>
                <span style={styles.statVal}>LIVE</span>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Title & Subtitle</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Custom Order?</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        No products found. Click "Add Product" to create one.
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod.id} style={styles.trBody}>
                        <td style={styles.td}>
                          <img src={prod.image} alt={prod.title} style={styles.thumbImg} />
                        </td>
                        <td style={styles.td}>
                          <div style={{ color: '#FFF', fontWeight: '400' }}>{prod.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#888' }}>{prod.subtitle || '—'}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.catBadge}>{prod.category || 'CARDS'}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: '#FFF', fontWeight: '400' }}>₦{prod.price.toLocaleString()}</span>
                        </td>
                        <td style={styles.td}>
                          {prod.allowsCustomization ? (
                            <span style={{ color: '#66BB6A', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={14} /> Yes
                            </span>
                          ) : (
                            <span style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={14} /> No
                            </span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button onClick={() => handleOpenEdit(prod)} style={styles.actionBtn} title="Edit Product">
                            <Edit2 size={16} color="#FFF" />
                          </button>
                          <button onClick={() => handleDeleteProduct(prod.id)} style={styles.actionBtn} title="Delete Product">
                            <Trash2 size={16} color="#FF6B6B" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <div>
            <div style={styles.pageTitleRow}>
              <div>
                <h1 style={styles.headingTitle}>Categories Manager</h1>
                <p style={styles.headingSub}>Create, edit, or delete product categories dynamically — linked directly to product listings</p>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Categories</span>
                <span style={styles.statVal}>{categories.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Active Catalog Products</span>
                <span style={styles.statVal}>{products.length}</span>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={styles.th}>Category Name</th>
                    <th style={styles.th}>URL Slug</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Assigned Products</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        No categories configured. Click "Add Category" to create one.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => {
                      const assignedCount = products.filter((p) => p.category === cat.name).length;
                      return (
                        <tr key={cat.id} style={styles.trBody}>
                          <td style={styles.td}>
                            <span style={styles.catBadge}>{cat.name}</span>
                          </td>
                          <td style={styles.td}>
                            <code style={{ fontSize: '0.8rem', color: '#C5A059' }}>{cat.slug || cat.name.toLowerCase()}</code>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#AAA', fontSize: '0.82rem' }}>{cat.description || '—'}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#FFF', fontWeight: '500' }}>{assignedCount} items</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button onClick={() => handleOpenEditCategory(cat)} style={styles.actionBtn} title="Edit Category">
                              <Edit2 size={16} color="#FFF" />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id, cat.name)} style={styles.actionBtn} title="Delete Category">
                              <Trash2 size={16} color="#FF6B6B" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal / Product Form Overlay */}
        {isFormOpen && (
          <div style={styles.modalOverlay} onClick={resetForm}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h2>
                <button onClick={resetForm} style={styles.closeBtn}>✕</button>
              </div>

              <form onSubmit={handleProductSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Handwritten Luxury Cards"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. linen texture finish"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Price (NGN) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="30000"
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Category (Dynamic)</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={styles.select}
                    >
                      {categories.length === 0 ? (
                        <>
                          <option value="CARDS">CARDS</option>
                          <option value="FLOWERS">FLOWERS</option>
                          <option value="CHOCOLATES">CHOCOLATES</option>
                          <option value="JEWELRY">JEWELRY</option>
                        </>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Image *</label>
                  
                  {/* File Upload Box */}
                  <div style={styles.uploadBox}>
                    {image ? (
                      <div style={styles.imagePreviewRow}>
                        <img src={image} alt="Preview" style={styles.uploadPreviewImg} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: '500' }}>Product Photo Selected</div>
                          <div style={{ fontSize: '0.72rem', color: '#888888', wordBreak: 'break-all', marginTop: '2px' }}>
                            {image.startsWith('data:') ? 'Local file attached (Ready to save)' : image}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <label style={styles.changeFileBtn}>
                              <Upload size={12} /> Replace Image
                              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                            <button type="button" onClick={() => setImage('')} style={styles.removeFileBtn}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label style={styles.dropzone}>
                        {uploading ? (
                          <div style={styles.dropzoneContent}>
                            <RefreshCw size={24} color="#C5A059" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.85rem', color: '#C5A059' }}>Uploading image to server...</span>
                          </div>
                        ) : (
                          <div style={styles.dropzoneContent}>
                            <Upload size={28} color="#C5A059" />
                            <div style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: '500' }}>
                              Click to select image file from computer
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888888' }}>
                              Supports PNG, JPG, WEBP, GIF (High resolution)
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>

                  {uploadError && <div style={styles.errorAlert}>{uploadError}</div>}

                  {/* Optional Toggle for Manual URL */}
                  <div style={{ marginTop: '6px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setUseUrlInput(!useUrlInput)}
                      style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {useUrlInput ? 'Hide URL paste input' : 'Paste external image URL instead'}
                    </button>
                  </div>

                  {useUrlInput && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        style={styles.input}
                      />
                    </div>
                  )}
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="allowsCustomization"
                    checked={allowsCustomization}
                    onChange={(e) => setAllowsCustomization(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="allowsCustomization" style={{ fontSize: '0.85rem', color: '#FFF', cursor: 'pointer' }}>
                    Accommodates Custom 3D Orders / Personalization
                  </label>
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={resetForm} className="btn-pill btn-pill-dark">
                    Cancel
                  </button>
                  <button type="submit" className="btn-pill btn-pill-solid">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal / Category Form Overlay */}
        {isCategoryModalOpen && (
          <div style={styles.modalOverlay} onClick={resetCategoryForm}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h2>
                <button onClick={resetCategoryForm} style={styles.closeBtn}>✕</button>
              </div>

              <form onSubmit={handleCategorySubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category Name *</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. LUXURY GIFTS"
                    style={styles.input}
                    required
                    autoFocus
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    placeholder="Brief description of products in this category..."
                    style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={resetCategoryForm} className="btn-pill btn-pill-dark">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.8rem',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#C5A059',
                      color: '#000',
                      border: 'none',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                    }}
                  >
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LIVE COUNTDOWN TIMER SETTINGS TAB */}
        {activeTab === 'timer' && (
          <div>
            <div style={styles.pageTitleRow}>
              <div>
                <h1 style={styles.headingTitle}>Live Homepage Countdown Timer Settings</h1>
                <p style={styles.headingSub}>Set up the countdown hours, minutes, and seconds stored in the database for the live homepage timer</p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', backgroundColor: '#161616', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '2.5rem', marginTop: '2rem' }}>
              <form onSubmit={handleSaveTimerSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HOURS</label>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={timerHours}
                      onChange={(e) => setTimerHours(e.target.value)}
                      style={{ padding: '1rem', backgroundColor: '#0F0F0F', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', color: '#FFF', fontSize: '1.4rem', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MINUTES</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(e.target.value)}
                      style={{ padding: '1rem', backgroundColor: '#0F0F0F', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', color: '#FFF', fontSize: '1.4rem', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SECONDS</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(e.target.value)}
                      style={{ padding: '1rem', backgroundColor: '#0F0F0F', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', color: '#FFF', fontSize: '1.4rem', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={savingTimer}
                    style={{ padding: '0.9rem 2.2rem', backgroundColor: '#C5A059', color: '#000', border: 'none', borderRadius: '9999px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {savingTimer ? 'Saving to Database...' : 'Save & Update Homepage Timer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal / Order Details View Overlay */}
        {viewingOrder && (
          <div style={styles.modalOverlay} onClick={() => setViewingOrder(null)}>
            <div style={{ ...styles.modalContent, maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Order Details #{viewingOrder.id}</h2>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>
                    Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => setViewingOrder(null)} style={styles.closeBtn}>
                  <X size={18} color="#AAA" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Order Type & Status Banner with Quick Status Dropdown */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F0F0F', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fulfillment Classification</div>
                    <div style={{ fontSize: '0.95rem', color: '#FFF', fontWeight: '500', marginTop: '2px' }}>
                      {viewingOrder.fulfillmentType === 'physical_card' ? 'Physical Card & Luxury Package' : 'Digital 3D Portal Experience'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={viewingOrder.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        handleOrderStatusToggle(viewingOrder.id, newStatus);
                        setViewingOrder({ ...viewingOrder, status: newStatus });
                      }}
                      style={{
                        backgroundColor: '#161616',
                        border: '1px solid #C5A059',
                        color: '#C5A059',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        outline: 'none',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <option value="pending">PENDING</option>
                      <option value="in_production">IN PRODUCTION</option>
                      <option value="ready">READY</option>
                      <option value="delivered">DELIVERED</option>
                    </select>
                  </div>
                </div>

                {/* 12-Char Access Code Section */}
                <div style={{ backgroundColor: '#0F0F0F', padding: '1rem', border: '1px solid rgba(197, 160, 89, 0.3)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#C5A059', textTransform: 'uppercase', letterSpacing: '0.08em' }}>12-Character Access Code Key</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#FFF', letterSpacing: '0.12em', fontWeight: '600' }}>
                      {viewingOrder.accessCode}
                    </div>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(viewingOrder.accessCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      className="btn-pill"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.9rem',
                        backgroundColor: copiedCode ? '#66BB6A' : 'rgba(255, 255, 255, 0.1)',
                        color: '#FFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>

                {/* Purchaser Details (Lower Recipient Box Removed) */}
                <div style={{ backgroundColor: '#0F0F0F', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Purchaser Information</div>
                  <div style={{ fontSize: '0.95rem', color: '#FFF', marginTop: '4px', fontWeight: '500' }}>{viewingOrder.purchaserName}</div>
                  <div style={{ fontSize: '0.82rem', color: '#AAA', marginTop: '2px' }}>{viewingOrder.purchaserEmail}</div>
                </div>

                {/* Package Items Breakdown */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Package Items Breakdown</div>
                  <div style={{ backgroundColor: '#0F0F0F', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.75rem 1rem' }}>
                    {viewingOrder.items && viewingOrder.items.length > 0 ? (
                      viewingOrder.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: idx < viewingOrder.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                          <span style={{ fontSize: '0.85rem', color: '#FFF' }}>{item.title || item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                          <span style={{ fontSize: '0.85rem', color: '#AAA' }}>₦{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: '#AAA' }}>Keepsake Custom Package</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', fontWeight: '600' }}>
                      <span style={{ color: '#FFF' }}>Total Order Value</span>
                      <span style={{ color: '#C5A059' }}>₦{viewingOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  {viewingOrder.status === 'in_production' && (
                    <button
                      onClick={() => {
                        handleOrderStatusToggle(viewingOrder.id, 'ready');
                        setViewingOrder({ ...viewingOrder, status: 'ready' });
                      }}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.6rem 1.2rem',
                        backgroundColor: '#C5A059',
                        color: '#000',
                        border: 'none',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Mark Ready & Send Email
                    </button>
                  )}
                  <button
                    onClick={() => handleSendNotification(viewingOrder.id)}
                    className="btn-pill"
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.6rem 1.2rem',
                    }}
                  >
                    Resend Email Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  // Login Gate Styles
  loginPage: {
    minHeight: '100vh',
    backgroundColor: '#111111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '3rem 2.5rem',
    textAlign: 'center',
  },
  loginLogo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  loginTitle: {
    fontSize: '1.2rem',
    fontWeight: '300',
    letterSpacing: '0.1em',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    marginTop: '0.5rem',
  },
  loginSub: {
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    color: '#C5A059',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  passwordInput: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  loginBtn: {
    width: '100%',
    padding: '0.9rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '0.5rem',
    backgroundColor: '#C5A059',
    color: '#000000',
    border: '1px solid #C5A059',
    borderRadius: '9999px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    transition: 'all 0.2s ease',
  },
  errorAlert: {
    fontSize: '0.8rem',
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: '0.65rem',
  },
  hintText: {
    fontSize: '0.72rem',
    color: '#666666',
    marginTop: '2rem',
    lineHeight: '1.4',
  },

  // Main Authenticated Admin Styles
  adminPage: {
    minHeight: '100vh',
    backgroundColor: '#111111',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif !important",
  },
  adminNavHeader: {
    width: '100%',
    backgroundColor: '#161616',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.25rem 0',
  },
  adminHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  brandTitle: {
    fontSize: '0.95rem',
    fontWeight: '300',
    letterSpacing: '0.08em',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  subdomainLabel: {
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    color: '#C5A059',
  },
  navTabs: {
    display: 'flex',
    gap: '1.5rem',
  },
  navTabBtn: {
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  mainContent: {
    paddingTop: '2.5rem',
    paddingBottom: '6rem',
  },
  pageTitleRow: {
    marginBottom: '2rem',
  },
  headingTitle: {
    fontSize: '2rem',
    fontWeight: '300',
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif !important",
  },
  headingSub: {
    fontSize: '0.82rem',
    color: '#888888',
    marginTop: '4px',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  alertBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    border: '1px solid #C5A059',
    color: '#FFFFFF',
    marginBottom: '2rem',
    fontSize: '0.85rem',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '0.72rem',
    color: '#888888',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  statVal: {
    fontSize: '2.2rem',
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif !important",
  },
  trHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  },
  th: {
    padding: '1.1rem 1.25rem',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    color: '#888888',
    textTransform: 'uppercase',
    fontWeight: '400',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  td: {
    padding: '1.1rem 1.25rem',
    verticalAlign: 'middle',
    fontSize: '0.88rem',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  thumbImg: {
    width: '54px',
    height: '54px',
    objectFit: 'cover',
  },
  catBadge: {
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    padding: '4px 8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#AAA',
  },
  codeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(197, 160, 89, 0.4)',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
  },
  statusTag: {
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    padding: '4px 8px',
    border: '1px solid',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    marginLeft: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '2.5rem',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  closeBtn: {
    fontSize: '1.2rem',
    color: '#888',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    fontSize: '0.78rem',
    color: '#888888',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  select: {
    width: '100%',
    padding: '0.9rem 1rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '0.5rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  uploadBox: {
    backgroundColor: '#0F0F0F',
    border: '1px dashed rgba(255, 255, 255, 0.25)',
    padding: '1rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  dropzone: {
    display: 'block',
    cursor: 'pointer',
    padding: '1.25rem',
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  imagePreviewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    textAlign: 'left',
  },
  uploadPreviewImg: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    border: '1px solid #C5A059',
  },
  changeFileBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    fontSize: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFF',
    cursor: 'pointer',
  },
  removeFileBtn: {
    padding: '4px 10px',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    color: '#FF6B6B',
    cursor: 'pointer',
  },
  filterPill: {
    padding: '0.5rem 1.1rem',
    fontSize: '0.78rem',
    fontWeight: '500',
    border: '1px solid',
    borderRadius: '9999px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    transition: 'all 0.2s ease',
  },
  physicalTag: {
    fontSize: '0.72rem',
    fontWeight: '500',
    letterSpacing: '0.04em',
    padding: '4px 8px',
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    border: '1px solid #C5A059',
    color: '#C5A059',
    borderRadius: '0px',
    whiteSpace: 'nowrap',
  },
  digitalTag: {
    fontSize: '0.72rem',
    fontWeight: '500',
    letterSpacing: '0.04em',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#AAA',
    borderRadius: '0px',
    whiteSpace: 'nowrap',
  },
};
