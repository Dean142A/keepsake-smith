'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { X, Plus, Trash2, RefreshCw } from 'lucide-react';

const ADDONS = [
  {
    id: 'addon-flw-1',
    title: 'Flowers',
    category: 'FLOWERS',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'addon-choc-1',
    title: 'Dark Chocolate',
    category: 'CHOCOLATE',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'addon-jwl-1',
    title: 'Gold Ring Band',
    category: 'JEWELRY',
    price: 19000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
  },
];

export default function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    addToCart,
    clearCart,
    cartTotal,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const isAdmin = pathname?.startsWith('/admin') || (
    typeof window !== 'undefined' && (
      window.location.hostname.startsWith('admin.') || 
      window.location.hostname.includes('admin')
    )
  );

  if (isAdmin || !isCartOpen) return null;

  const handleCheckout = async () => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    setCheckoutError('');

    // Extract custom personalization payload if present in cart
    const customItem = cart.find((i) => i.personalization);
    const personalization = customItem?.personalization || {};

    const payload = {
      purchaserName: 'Alexander Smith',
      purchaserEmail: 'alexander@example.com',
      recipientType: personalization.recipientName ? 'gift' : 'self',
      recipientName: personalization.recipientName || 'Alexander Smith',
      recipientEmail: 'alexander@example.com',
      fulfillmentType: 'physical_card',
      totalAmount: cartTotal,
      items: cart.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      customMessage: personalization.message || 'Happy Anniversary my love! Forever & always.',
      customPhoto: personalization.photo || null,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.accessCode) {
        if (clearCart) clearCart();
        setIsCartOpen(false);
        router.push(`/thank-you?code=${encodeURIComponent(data.accessCode)}&orderId=${encodeURIComponent(data.order.id)}`);
      } else {
        setCheckoutError(data.error || 'Checkout failed. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      setCheckoutError('Network error completing checkout.');
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.headerRow}>
          <h2 style={styles.title}>your bag</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            style={styles.closeBtn}
            className="btn-pill"
          >
            Close
          </button>
        </div>

        <p style={styles.subtitle}>
          this explains color systems and color usages so they are used the way to brand identity portrays
        </p>

        {/* Cart Items List */}
        <div style={styles.itemsContainer}>
          {cart.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: '#888888' }}>Your bag is currently empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={styles.cartCard}>
                <div style={styles.imgWrapper}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={styles.cartImg}
                  />
                </div>
                <div style={styles.cardDetails}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.itemTitle}>{item.title}</h3>
                      <p style={styles.itemSubtitle}>“{item.subtitle || 'custom edition'}”</p>
                    </div>
                    <div style={styles.priceContainer}>
                      <span style={styles.priceLabel}>Price</span>
                      <span style={styles.priceValue}>₦{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <div className="quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </button>

                      <span className="quantity-val">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} color="#888" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Add A Little Extra Section */}
          <div style={styles.extraSection}>
            <h4 style={styles.extraTitle}>ADD A LITTLE EXTRA</h4>
            <div style={styles.addonGrid}>
              {ADDONS.map((addon) => (
                <div key={addon.id} style={styles.addonCard}>
                  <img
                    src={addon.image}
                    alt={addon.title}
                    style={styles.addonImg}
                  />
                  <div style={styles.addonDetails}>
                    <span style={styles.addonCategory}>{addon.category}</span>
                    <span style={styles.addonPrice}>₦{addon.price.toLocaleString()}</span>
                    <button
                      onClick={() => addToCart({
                        id: addon.id,
                        title: addon.title,
                        subtitle: addon.category.toLowerCase(),
                        price: addon.price,
                        image: addon.image,
                        size: 'STD 1',
                      })}
                      style={styles.addBtn}
                    >
                      Add item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Footer Checkout CTA */}
        <div style={styles.footerBar}>
          <div style={styles.totalRow}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Subtotal</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '400', color: '#FFF' }}>
              ₦{cartTotal.toLocaleString()}
            </span>
          </div>

          {checkoutError && (
            <div style={{ fontSize: '0.8rem', color: '#FF6B6B', marginBottom: '0.75rem', textAlign: 'center' }}>
              {checkoutError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0}
            className="btn-pill btn-pill-solid"
            style={styles.checkoutBtn}
          >
            {submitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} className="spin" /> Generating Access Code...
              </span>
            ) : (
              'Continue to checkout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '100%',
    maxWidth: '620px',
    height: '100%',
    backgroundColor: '#121212',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2.5rem 2rem 2rem 2rem',
    boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
    overflowY: 'auto',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: '300',
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: '0.4rem 1.2rem',
    fontSize: '0.8rem',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#777777',
    lineHeight: '1.5',
    marginBottom: '2rem',
  },
  itemsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  emptyState: {
    padding: '3rem 0',
    textAlign: 'center',
  },
  cartCard: {
    display: 'flex',
    gap: '1.25rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '0px',
    padding: '1.25rem',
  },
  imgWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '0px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  cartImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: '1.1rem',
    fontWeight: '400',
    color: '#FFFFFF',
  },
  itemSubtitle: {
    fontSize: '0.8rem',
    color: '#888888',
    marginTop: '2px',
  },
  priceContainer: {
    textAlign: 'right',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.65rem',
    color: '#666666',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: '1.1rem',
    fontWeight: '400',
    color: '#FFFFFF',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  extraSection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  extraTitle: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#888888',
    marginBottom: '1.25rem',
  },
  addonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  addonCard: {
    backgroundColor: '#141414',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '0px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  addonImg: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
  },
  addonDetails: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  addonCategory: {
    fontSize: '0.65rem',
    color: '#777777',
  },
  addonPrice: {
    fontSize: '0.9rem',
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: '6px',
  },
  addBtn: {
    fontSize: '0.75rem',
    padding: '0.4rem 0.8rem',
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0px',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  footerBar: {
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    fontSize: '0.9rem',
    textTransform: 'none',
  },
};
