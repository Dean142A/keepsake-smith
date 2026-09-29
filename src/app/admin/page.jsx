'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Package, Send, RefreshCw, Key, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Product Form State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('CARDS');
  const [image, setImage] = useState('');
  const [allowsCustomization, setAllowsCustomization] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resOrd] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
      ]);
      const dataProd = await resProd.json();
      const dataOrd = await resOrd.json();

      if (dataProd.success) setProducts(dataProd.products || []);
      if (dataOrd.success) setOrders(dataOrd.orders || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setPrice('');
    setCategory('CARDS');
    setImage('');
    setAllowsCustomization(true);
    setEditingProduct(null);
    setIsFormOpen(false);
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
      }
    } catch (err) {
      console.error('Error deleting product:', err);
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

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <span style={styles.badgeText}>admin.thekeepsakesmith.com</span>
            <h1 className="heading-xl">CMS & Production CRM</h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {activeTab === 'products' && (
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="btn-pill btn-pill-solid"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} /> Add Product
              </button>
            )}
            <button onClick={fetchData} className="btn-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'orders' ? '2px solid #C5A059' : 'none',
              color: activeTab === 'orders' ? '#FFFFFF' : '#888888',
            }}
          >
            Orders & Access Codes Queue ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'products' ? '2px solid #C5A059' : 'none',
              color: activeTab === 'products' ? '#FFFFFF' : '#888888',
            }}
          >
            Product Catalog ({products.length})
          </button>
        </div>

        {/* Alert Status Banner */}
        {statusMsg && (
          <div style={styles.alertBanner} onClick={() => setStatusMsg('')}>
            {statusMsg}
          </div>
        )}

        {/* ORDERS CRM TAB */}
        {activeTab === 'orders' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Orders</span>
                <span style={styles.statVal}>{orders.length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>In Production</span>
                <span style={styles.statVal}>{orders.filter((o) => o.status === 'in_production').length}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Ready / Delivered</span>
                <span style={styles.statVal}>{orders.filter((o) => o.status === 'ready' || o.status === 'delivered').length}</span>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Purchaser & Recipient</th>
                    <th style={styles.th}>12-Char Access Code</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Fulfillment Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        No live orders in queue.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} style={styles.trBody}>
                        <td style={styles.td}>
                          <div style={{ color: '#FFF', fontWeight: '400', fontFamily: 'monospace' }}>#{ord.id}</div>
                          <div style={{ fontSize: '0.72rem', color: '#777' }}>
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ color: '#FFF', fontWeight: '400' }}>{ord.purchaserName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#888' }}>{ord.purchaserEmail}</div>
                          {ord.recipientName && (
                            <div style={{ fontSize: '0.75rem', color: '#C5A059', marginTop: '4px' }}>
                              🎁 To: {ord.recipientName} ({ord.recipientEmail || 'digital'})
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.codeBadge}>
                            <Key size={12} color="#C5A059" /> {ord.accessCode}
                          </div>
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
                          {ord.status === 'in_production' && (
                            <button
                              onClick={() => handleOrderStatusToggle(ord.id, 'ready')}
                              className="btn-pill btn-pill-solid"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', marginRight: '6px' }}
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
                <span style={styles.statVal}>ACTIVE</span>
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
                    <label style={styles.label}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={styles.select}
                    >
                      <option value="CARDS">CARDS</option>
                      <option value="FLOWERS">FLOWERS</option>
                      <option value="CHOCOLATES">CHOCOLATES</option>
                      <option value="JEWELRY">JEWELRY</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    style={styles.input}
                  />
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
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: '2rem',
    minHeight: '85vh',
    paddingBottom: '6rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  badgeText: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#C5A059',
    textTransform: 'uppercase',
  },
  tabBar: {
    display: 'flex',
    gap: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '2.5rem',
  },
  tabBtn: {
    padding: '0.75rem 0',
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  alertBanner: {
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    border: '1px solid #C5A059',
    color: '#FFFFFF',
    marginBottom: '2rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888888',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#FFFFFF',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
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
  },
  trBody: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  td: {
    padding: '1rem 1.25rem',
    verticalAlign: 'middle',
    fontSize: '0.9rem',
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
    backgroundColor: '#141414',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '2.5rem',
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
  },
  closeBtn: {
    fontSize: '1.2rem',
    color: '#888',
    cursor: 'pointer',
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
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.9rem 1rem',
    backgroundColor: '#181818',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
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
};
