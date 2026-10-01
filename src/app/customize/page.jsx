'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CustomizePage() {
  const { addToCart, setIsCartOpen } = useCart();
  const [recipientName, setRecipientName] = useState('Jane Forster');
  const [recipientPhone, setRecipientPhone] = useState('+234 000 0000 000');
  const [cardMessage, setCardMessage] = useState('Happy Anniversary my love! Forever & always.');
  const [photoPreview, setPhotoPreview] = useState(null);

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

  const handleAddToCart = () => {
    addToCart({
      id: `custom-gift-${Date.now()}`,
      title: 'Custom Keepsake 3D Card',
      subtitle: `For ${recipientName || 'Recipient'}`,
      price: 8500,
      quantity: 1,
      image: photoPreview || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
      size: 'CUSTOM 3D',
      personalization: {
        recipientName,
        recipientPhone,
        message: cardMessage,
        photo: photoPreview,
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
              {photoPreview ? (
                <div style={styles.liveCardWrap}>
                  <img src={photoPreview} alt="Recipient Preview" style={styles.previewImage} />
                  <div style={styles.cardOverlayText}>
                    <div style={styles.cardHeaderSmall}>THE KEEPSAKE SMITH</div>
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
                  <p style={styles.previewSub}>See updates as you edit and make changes</p>
                  
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
              this explains color systems and color usages so they are used the way to brand identity portrays
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>
          </div>

          {/* Right Column: Personalization Form */}
          <div style={styles.formContainer}>
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
                rows={5}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Write a message"
                style={styles.textarea}
              />
            </div>

            <p style={styles.formSubtext}>
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>
          </div>
        </div>

        {/* Totals Bar */}
        <div style={styles.totalsBar}>
          <div>
            <div style={styles.totalsLabel}>TOTALS</div>
            <div style={styles.totalsValue}>₦8,500</div>
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
            <p className="text-muted">
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>
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
