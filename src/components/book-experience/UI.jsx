'use client';

import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/audios/page-flip-01a.mp3');
      audio.play().catch(() => {});
    }
  }, [page]);

  return (
    <main style={styles.uiOverlay}>
      {/* Top Header Row */}
      <div style={styles.topHeaderRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        </div>

        <button onClick={onToggleMusic} style={styles.audioPill}>
          {musicActive ? (
            <span style={styles.iconBtnInner}>
              <Volume2 size={15} /> Music On
            </span>
          ) : (
            <span style={styles.iconBtnInner}>
              <VolumeX size={15} /> Tap for Music
            </span>
          )}
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
};
