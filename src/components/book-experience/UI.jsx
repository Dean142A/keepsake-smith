'use client';

import React, { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { Volume2, VolumeX, ArrowLeft, Mail, ChevronLeft, ChevronRight, X } from 'lucide-react';

const defaultPictures = [
  'DSC00680',
  'DSC00933',
  'DSC00966',
  'DSC00983',
  'DSC01011',
  'DSC01040',
];

export const pageAtom = atom(0);

export const pages = [
  {
    front: 'book-cover',
    back: defaultPictures[0],
  },
];

for (let i = 1; i < defaultPictures.length - 1; i += 2) {
  pages.push({
    front: defaultPictures[i % defaultPictures.length],
    back: defaultPictures[(i + 1) % defaultPictures.length],
  });
}

pages.push({
  front: defaultPictures[defaultPictures.length - 1],
  back: 'book-back',
});

export const UI = ({ personalization, onExit, musicActive, onToggleMusic }) => {
  const [page, setPage] = useAtom(pageAtom);
  const [showDedication, setShowDedication] = useState(false);

  // Play page flip sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/audios/page-flip-01a.mp3');
      audio.play().catch(() => {});
    }
  }, [page]);

  // Keyboard navigation: Left/Right arrows to flip pages, Escape to close note
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setPage((prev) => Math.min(pages.length, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setPage((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setShowDedication(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPage]);

  const maxPage = pages.length;

  return (
    <main style={styles.uiOverlay}>
      {/* Top Header Row */}
      <div style={styles.topHeaderRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onExit && (
            <button onClick={onExit} style={styles.exitBtn}>
              <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Exit Portal
            </button>
          )}

          {personalization && (
            <div style={styles.recipientBadge}>
              <span style={styles.badgeName}>
                For {personalization.recipientName || 'Recipient'}
              </span>
            </div>
          )}

          {personalization?.message && (
            <button
              onClick={() => setShowDedication(true)}
              style={styles.dedicationBtn}
            >
              <Mail size={14} style={{ marginRight: '6px', color: '#C5A059' }} /> Read Dedication Note
            </button>
          )}
        </div>

        <button onClick={onToggleMusic} style={styles.audioPill}>
          {musicActive ? (
            <span style={styles.iconBtnInner}>
              <Volume2 size={15} color="#C5A059" /> Music On
            </span>
          ) : (
            <span style={styles.iconBtnInner}>
              <VolumeX size={15} /> Tap for Music
            </span>
          )}
        </button>
      </div>

      {/* Floating Side Arrow Controls for easy page turning */}
      <div style={styles.sideControls}>
        <button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          style={{
            ...styles.sideArrowBtn,
            opacity: page === 0 ? 0.3 : 1,
            pointerEvents: page === 0 ? 'none' : 'auto',
          }}
          title="Previous Page"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => setPage((prev) => Math.min(maxPage, prev + 1))}
          disabled={page === maxPage}
          style={{
            ...styles.sideArrowBtn,
            opacity: page === maxPage ? 0.3 : 1,
            pointerEvents: page === maxPage ? 'none' : 'auto',
          }}
          title="Next Page"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Page Switcher Navigation */}
      <div style={styles.navRow}>
        <div style={styles.navBar}>
          {[...pages].map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.pageBtn,
                ...(index === page ? styles.pageBtnActive : styles.pageBtnInactive),
              }}
              onClick={() => setPage(index)}
            >
              {index === 0 ? 'Cover' : `Page ${index}`}
            </button>
          ))}
          <button
            style={{
              ...styles.pageBtn,
              ...(page === pages.length ? styles.pageBtnActive : styles.pageBtnInactive),
            }}
            onClick={() => setPage(pages.length)}
          >
            Back Cover
          </button>
        </div>
      </div>

      {/* Personal Dedication Modal Card */}
      {showDedication && personalization && (
        <div style={styles.modalBackdrop} onClick={() => setShowDedication(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTag}>PERSONAL GIFT DEDICATION</span>
                <h3 style={styles.modalTitle}>
                  For {personalization.recipientName || 'You'}
                </h3>
                {personalization.sender && (
                  <p style={styles.modalSender}>From: {personalization.sender}</p>
                )}
              </div>
              <button
                onClick={() => setShowDedication(false)}
                style={styles.closeBtn}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Photo if attached */}
            {personalization.photo && (
              <div style={styles.photoContainer}>
                <img
                  src={personalization.photo}
                  alt="Personalized Keepsake Memory"
                  style={styles.personalPhoto}
                />
              </div>
            )}

            {/* Personalized Message */}
            <div style={styles.messageBody}>
              <p style={styles.messageText}>
                "{personalization.message || 'We craft gifts that are memorable.'}"
              </p>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowDedication(false)}
                className="btn-pill btn-pill-solid"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Continue Viewing 3D Keepsake
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const styles = {
  uiOverlay: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2rem',
  },
  topHeaderRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  exitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.6rem 1.25rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: '0.78rem',
    fontWeight: '400',
    cursor: 'pointer',
  },
  recipientBadge: {
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '0.6rem 1.25rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: '0.85rem',
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: '0.02em',
  },
  dedicationBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.6rem 1.25rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(30, 26, 18, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(197, 160, 89, 0.4)',
    color: '#F4ECE1',
    fontSize: '0.78rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  audioPill: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '0.6rem 1.2rem',
    borderRadius: '20px',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: '400',
    cursor: 'pointer',
    userSelect: 'none',
  },
  iconBtnInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  sideControls: {
    position: 'absolute',
    top: '50%',
    left: '1.5rem',
    right: '1.5rem',
    transform: 'translateY(-50%)',
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  sideArrowBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',
    transition: 'all 0.2s ease',
  },
  navRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
  navBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '0.75rem 1.25rem',
    borderRadius: '40px',
    maxWidth: '100%',
    overflowX: 'auto',
  },
  pageBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '400',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },
  pageBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#111111',
    fontWeight: '400',
  },
  pageBtnInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: '#CCCCCC',
    fontWeight: '400',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(16px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    pointerEvents: 'auto',
  },
  modalCard: {
    backgroundColor: '#161616',
    border: '1px solid rgba(197, 160, 89, 0.3)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '520px',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTag: {
    fontSize: '0.68rem',
    letterSpacing: '0.14em',
    color: '#C5A059',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: '1.4rem',
    color: '#FFFFFF',
    fontWeight: '300',
    margin: '4px 0',
  },
  modalSender: {
    fontSize: '0.82rem',
    color: '#A0A0A0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888888',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    width: '100%',
    height: '240px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  personalPhoto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  messageBody: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
  },
  messageText: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#E0E0E0',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  modalFooter: {
    marginTop: '0.5rem',
  },
};
