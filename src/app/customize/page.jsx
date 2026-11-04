'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Handwritten Cards',
    subtitle: 'maquette dé keepsake',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    category: 'CARDS',
  },
  {
    id: 'prod-2',
    title: 'Handwritten Cards (Black Envelope)',
    subtitle: 'black envelope luxury edition',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    category: 'CARDS',
  },
  {
    id: 'prod-3',
    title: 'Digital 3D Maquette Experience',
    subtitle: 'virtual memorial & keepsake 3D WebGL',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    category: 'DIGITAL',
  }
];

export default function CustomizePage() {
  const { addToCart, setIsCartOpen } = useCart();
  const [productsList, setProductsList] = useState(DEFAULT_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recipientName, setRecipientName] = useState('Jane Forster');
  const [recipientPhone, setRecipientPhone] = useState('+234 000 0000 000');
  const [cardMessage, setCardMessage] = useState('Happy Anniversary my love! Forever & always.');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [cardSide, setCardSide] = useState('front'); // 'front' | 'inside'
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Fetch available products from catalog API on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          const customizable = data.products.filter(p => p.allowsCustomization !== false);
          if (customizable.length > 0) {
            setProductsList(customizable);
          }
        }
      } catch (err) {
        console.error('Error loading catalog products for customization:', err);
      }
    }
    loadCatalog();
  }, []);

  const selectedProduct = productsList.find((p) => p.id === selectedProductId) || null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const CUSTOMIZATION_FEE = 5000;
  const totalPrice = selectedProduct ? selectedProduct.price + CUSTOMIZATION_FEE : 0;

  const handleAddToCart = () => {
    if (!selectedProduct) {
      setValidationError('Please select a product to customize from the dropdown first.');
      return;
    }

    setValidationError('');

    addToCart({
      id: `${selectedProduct.id}-custom-${Date.now()}`,
      title: selectedProduct.title,
      subtitle: `Customized for ${recipientName || 'Recipient'}`,
      price: totalPrice,
      quantity: 1,
      image: photoPreview || selectedProduct.image,
      size: 'CUSTOM 3D',
      personalization: {
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        productBasePrice: selectedProduct.price,
        customizationFee: CUSTOMIZATION_FEE,
        recipientName,
        recipientPhone,
        message: cardMessage,
        photo: photoPreview || selectedProduct.image,
      },
    });
    if (setIsCartOpen) setIsCartOpen(true);
  };

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Title Area */}
        <div style={styles.headerRow}>
          <h1 className="heading-xl">customize</h1>
          <div style={styles.emblemIcon}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
              <path d="M50 15 C30 15, 15 30, 15 50" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div style={styles.customGrid}>
          {/* Left Column: Live Preview Box */}
          <div style={styles.previewContainer}>
            {/* View Switcher Controls */}
            {(photoPreview || selectedProduct) && (
              <div style={styles.previewSwitcher}>
                <button
                  type="button"
                  onClick={() => setCardSide('front')}
                  style={{
                    ...styles.switchBtn,
                    backgroundColor: cardSide === 'front' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    borderColor: cardSide === 'front' ? '#C5A059' : 'rgba(255, 255, 255, 0.2)',
                    color: cardSide === 'front' ? '#FFFFFF' : '#888888',
                  }}
                >
                  Front Cover
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('inside')}
                  style={{
                    ...styles.switchBtn,
                    backgroundColor: cardSide === 'inside' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    borderColor: cardSide === 'inside' ? '#C5A059' : 'rgba(255, 255, 255, 0.2)',
                    color: cardSide === 'inside' ? '#FFFFFF' : '#888888',
                  }}
                >
                  Inside Letter
                </button>
              </div>
            )}

            <div
              style={styles.previewBox}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {photoPreview || selectedProduct ? (
                <div
                  style={{
                    ...styles.cardPerspectiveWrap,
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  }}
                >
                  {cardSide === 'front' ? (
                    /* Front Cover View */
                    <div style={styles.frontCard}>
                      <div style={styles.frontImageWrap}>
                        <img
                          src={photoPreview || selectedProduct?.image}
                          alt="Recipient Preview"
                          style={styles.previewImage}
                        />
                      </div>
                      <div style={styles.cardOverlayText}>
                        <div style={styles.cardHeaderSmall}>
                          THE KEEPSAKE SMITH • ARTISAN EDITION
                        </div>
                        <div style={styles.cardName}>{recipientName || 'Jane Forster'}</div>
                        <div style={styles.cardBadgeTag}>
                          {selectedProduct?.title || 'Handcrafted Keepsake'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Inside Letter View */
                    <div style={styles.insideCard}>
                      <div style={styles.letterHeader}>
                        <div style={styles.cardHeaderSmall}>A BESPOKE KEEPSAKE DEDICATION</div>
                        <div style={styles.letterTo}>To: {recipientName || 'Jane Forster'}</div>
                      </div>
                      <div style={styles.letterBody}>
                        “{cardMessage || 'Happy Anniversary my love! Forever & always.'}”
                      </div>
                      <div style={styles.letterFooter}>
                        <div style={styles.waxSeal}>
                          <img
                            src="/keepsake.svg"
                            alt="Emblem"
                            width="28"
                            height="28"
                            style={{ opacity: 0.9 }}
                          />
                        </div>
                        <div style={styles.signatureText}>The Keepsake Smith</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Exact Figma Placeholder */
                <div style={styles.previewPlaceholder}>
                  <svg
                    width="68"
                    height="68"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="#555555"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: '1.25rem' }}
                  >
                    <rect x="8" y="8" width="48" height="48" rx="14" />
                    <circle cx="25" cy="25" r="4.5" />
                    <path d="M12 46 C22 34, 28 42, 38 32 C46 25, 52 40, 52 46" />
                  </svg>
                  <h3 style={styles.previewTitle}>See Live Preview</h3>
                  <p style={styles.previewSub}>See updates as you edit and make changes</p>
                </div>
              )}
            </div>
            <p style={styles.columnSubtext}>
              Interactive 3D preview tilt enabled. Access code is printed onto the physical wax keepsake upon dispatch.
            </p>
          </div>

          {/* Right Column: Personalization Form */}
          <div style={styles.formContainer}>
            {/* Product Selector Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Product to Customize *</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setValidationError('');
                }}
                style={styles.selectInput}
              >
                <option value="">-- Choose a product to customize --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — ₦{p.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Photo Upload */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Recipient Photo</label>
              <label style={styles.uploadDropzone}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <Upload size={18} color="#888" />
                <span style={styles.uploadText}>
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </span>
              </label>
            </div>

            {/* Recipients Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Recipients Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Jane Forster"
                style={styles.input}
              />
            </div>

            {/* Recipients Phone Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Recipients Phone Number</label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+234 000 0000 000"
                style={styles.input}
              />
            </div>

            {/* Card Message */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Card Message</label>
              <textarea
                rows={4}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Write a custom message"
                style={styles.textarea}
              />
            </div>

            {validationError && (
              <div style={styles.errorBanner}>
                <AlertCircle size={16} color="#FF6B6B" /> {validationError}
              </div>
            )}
          </div>
        </div>

        {/* Totals Bar */}
        <div style={styles.totalsBar}>
          <div>
            <div style={styles.totalsLabel}>TOTALS</div>
            <div style={styles.totalsValue}>
              ₦{totalPrice.toLocaleString()}
            </div>
            {selectedProduct && (
              <div style={{ fontSize: '0.75rem', color: '#888888', marginTop: '4px' }}>
                Base ₦{selectedProduct.price.toLocaleString()} + ₦{CUSTOMIZATION_FEE.toLocaleString()} Customization
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="btn-pill btn-pill-solid"
            style={{ padding: '0.9rem 2.5rem', fontSize: '0.9rem' }}
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: '2rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
  },
  emblemIcon: {
    opacity: 0.8,
  },
  customGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
    gap: '3rem',
    marginBottom: '3rem',
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  previewSwitcher: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.25rem',
  },
  switchBtn: {
    padding: '0.45rem 1.1rem',
    border: '1px solid',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  previewBox: {
    width: '100%',
    height: '520px',
    backgroundColor: '#121212',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    perspective: '1200px',
    padding: '1.5rem',
  },
  cardPerspectiveWrap: {
    width: '100%',
    maxWidth: '380px',
    height: '100%',
    maxHeight: '460px',
    transition: 'transform 0.15s ease-out',
    transformStyle: 'preserve-3d',
  },
  frontCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#171717',
    border: '1px solid rgba(197, 160, 89, 0.35)',
    borderRadius: '10px',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.85), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  frontImageWrap: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0c0c0c',
  },
  insideCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#161616',
    border: '1px solid rgba(197, 160, 89, 0.35)',
    borderRadius: '10px',
    padding: '2rem 1.75rem',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 70%)',
  },
  letterHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.85rem',
  },
  letterTo: {
    fontSize: '1.25rem',
    color: '#D9D2C7',
    fontWeight: '300',
    marginTop: '4px',
    letterSpacing: '0.04em',
  },
  letterBody: {
    flex: 1,
    padding: '1.5rem 0',
    fontSize: '0.95rem',
    lineHeight: '1.7',
    color: '#E0E0E0',
    fontStyle: 'italic',
    fontFamily: 'serif, Georgia, "Times New Roman"',
    overflowY: 'auto',
  },
  letterFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waxSeal: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#1A1814',
    border: '1px solid rgba(197, 160, 89, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
  },
  signatureText: {
    fontSize: '0.78rem',
    letterSpacing: '0.08em',
    color: '#A88653',
    textTransform: 'lowercase',
  },
  previewPlaceholder: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: '1.45rem',
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: '6px',
    letterSpacing: '-0.01em',
  },
  previewSub: {
    fontSize: '0.82rem',
    color: '#777777',
    maxWidth: '260px',
    lineHeight: '1.4',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardOverlayText: {
    padding: '1.1rem 1.25rem',
    backgroundColor: '#141414',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardHeaderSmall: {
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    color: '#A88653',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: '1.15rem',
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: '0.02em',
  },
  cardBadgeTag: {
    fontSize: '0.75rem',
    color: '#888888',
    marginTop: '2px',
  },
  columnSubtext: {
    fontSize: '0.72rem',
    color: '#555555',
    lineHeight: '1.5',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8rem',
    color: '#888888',
    letterSpacing: '0.02em',
  },
  uploadDropzone: {
    border: '1px dashed rgba(255, 255, 255, 0.3)',
    borderRadius: '0px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  uploadText: {
    fontSize: '0.8rem',
    color: '#888888',
  },
  selectInput: {
    width: '100%',
    padding: '1.1rem 1.25rem',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  errorBanner: {
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#FF6B6B',
    fontSize: '0.85rem',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '1.1rem 1.25rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '1.1rem 1.25rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
  },
  formSubtext: {
    fontSize: '0.72rem',
    color: '#555555',
    lineHeight: '1.5',
    marginTop: '0.5rem',
  },
  totalsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '3rem 0 4rem 0',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  totalsLabel: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#888888',
  },
  totalsValue: {
    fontSize: '2.4rem',
    fontWeight: '300',
    color: '#FFFFFF',
  },
  calloutBanner: {
    padding: '5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '3rem',
  },
};
