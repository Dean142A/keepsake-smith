'use client';

import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';

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

export const UI = ({ personalization }) => {
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/audios/page-flip-01a.mp3');
      audio.play().catch(() => {});
    }
  }, [page]);

  return (
    <>
      <main style={styles.uiOverlay}>
        {/* Recipient Greeting Banner */}
        {personalization && (
          <div style={styles.recipientBadge}>
            <span style={styles.badgeSub}>PERSONALIZED KEEPSAKE FOR</span>
            <span style={styles.badgeName}>{personalization.recipientName || 'Valued Recipient'}</span>
          </div>
        )}

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
    </>
  );
};

const styles = {
  uiOverlay: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2rem',
  },
  recipientBadge: {
    pointerEvents: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '0.75rem 1.25rem',
    borderRadius: '0px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  badgeSub: {
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    color: '#A88653',
  },
  badgeName: {
    fontSize: '1.1rem',
    color: '#FFFFFF',
    fontWeight: '300',
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
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },
  pageBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#111111',
    fontWeight: '600',
  },
  pageBtnInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: '#CCCCCC',
  },
};
