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
            <div style={styles.previewBox}>
              {photoPreview || selectedProduct ? (
                <div style={styles.liveCardWrap}>
                  <img
                    src={photoPreview || selectedProduct?.image}
                    alt="Recipient Preview"
                    style={styles.previewImage}
                  />
                  <div style={styles.cardOverlayText}>
                    <div style={styles.cardHeaderSmall}>
                      THE KEEPSAKE SMITH {selectedProduct ? `• ${selectedProduct.title.toUpperCase()}` : ''}
                    </div>
                    <div style={styles.cardName}>{recipientName || 'Recipient Name'}</div>
                    <p style={styles.cardMsgPreview}>
                      "{cardMessage || 'Your custom handwritten message will appear here in gold foil typography.'}"
                    </p>
                  </div>
                </div>
              ) : (
                <div style={styles.previewPlaceholder}>
                  <ImageIcon size={48} color="#666" style={{ marginBottom: '1rem' }} />
                  <h3 style={styles.previewTitle}>See Live Preview</h3>
                  <p style={styles.previewSub}>Select a product to view dynamic 3D card updates</p>
                  
                  {/* Dynamic text preview */}
                  <div style={styles.cardTextDisplay}>
                    <div style={{ fontSize: '0.85rem', color: '#A0A0A0' }}>
                      To: <span style={{ color: '#FFF' }}>{recipientName || 'Name'}</span>
                    </div>
                    {cardMessage && (
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        "{cardMessage}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p style={styles.columnSubtext}>
              Custom 3D WebGL experiences are linked directly to your access code key upon checkout.
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

        {/* Callout Section */}
        <section style={styles.calloutBanner}>
          <div style={{ flex: 1.2 }}>
            <h2 className="heading-xl">
              we <span className="metallic-pill-badge" /> know <br />
              how to make this <br />
              special
            </h2>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
            <button
              onClick={handleAddToCart}
              className="btn-pill btn-pill-dark"
            >
              Order Now
            </button>
          </div>
        </section>
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
  previewBox: {
    width: '100%',
    height: '480px',
    backgroundColor: '#141414',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewPlaceholder: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: '1.4rem',
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  previewSub: {
    fontSize: '0.8rem',
    color: '#777777',
  },
  cardTextDisplay: {
    marginTop: '2rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '0px',
    maxWidth: '320px',
  },
  liveCardWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardOverlayText: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    padding: '1.25rem',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    borderRadius: '0px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  cardHeaderSmall: {
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    color: '#A88653',
    marginBottom: '4px',
  },
  cardName: {
    fontSize: '1.2rem',
    color: '#FFFFFF',
    fontWeight: '400',
  },
  cardMsgPreview: {
    fontSize: '0.8rem',
    color: '#CCCCCC',
    marginTop: '4px',
    fontStyle: 'italic',
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
