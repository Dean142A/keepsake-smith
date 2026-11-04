'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, RefreshCw } from 'lucide-react';

import dynamic from 'next/dynamic';

const BookViewer = dynamic(() => import('@/components/book-experience/BookViewer'), {
  ssr: false,
});

function PortalContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams?.get('code') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [experienceData, setExperienceData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialCode) {
      handleFormatCode(initialCode);
    }
  }, [initialCode]);

  const handleFormatCode = (val) => {
    const raw = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    let formatted = raw;
    if (raw.length > 4 && raw.length <= 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    } else if (raw.length > 8) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
    }
    setCode(formatted);
    setError('');
  };

  const handleRedeem = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter a valid 12-character access code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to validate access code.');
        setLoading(false);
        return;
      }

      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setProgress(Math.min(100, p));
        if (p >= 100) {
          clearInterval(interval);
          setExperienceData(data.package);
          setLoading(false);
        }
      }, 120);
    } catch (err) {
      setError('Network error validating code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="container">
        {!experienceData ? (
          <>
            {/* Header Title */}
            <div style={styles.headerRow}>
              <div>
                <h1 className="heading-xl">3D Keepsake Portal</h1>
              </div>
            </div>

            {/* Access Code Input */}
            <div style={styles.cardContainer}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Enter Your 12-Character Access Code</h2>
                <p style={styles.cardSub}>
                  Enter the access code printed on your physical keepsake card or received in your gift email to launch your interactive 3D WebGL experience.
                </p>
                <div style={styles.demoChipWrap}>
                  <button
                    type="button"
                    onClick={() => handleFormatCode('KPSK892F37A1')}
                    style={styles.demoChip}
                    title="Click to fill sample code"
                  >
                    <span style={{ color: '#C5A059' }}>✦ Try Demo Code:</span> KPSK-892F-37A1
                  </button>
                </div>
              </div>

              <form onSubmit={handleRedeem} style={styles.form}>
                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    maxLength={16}
                    value={code}
                    onChange={(e) => handleFormatCode(e.target.value)}
                    placeholder="KPSK-892F-37A1"
                    style={styles.codeInput}
                    disabled={loading}
                  />
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}

                {loading && (
                  <div style={styles.progressWrap}>
                    <div style={styles.progressTrack}>
                      <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                    </div>
                    <span style={styles.progressText}>Streaming 3D WebGL Experience... {progress}%</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill btn-pill-solid"
                  style={styles.submitBtn}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spin" style={{ marginRight: '8px' }} /> Loading...
                    </>
                  ) : (
                    <>
                      Unlock 3D Experience <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Interactive R3F 3D Animated Book Experience */
          <BookViewer
            personalization={experienceData.personalization}
            onExit={() => setExperienceData(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', padding: '4rem', textAlign: 'center', color: '#FFF' }}>Loading 3D Keepsake Portal...</div>}>
      <PortalContent />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: '80vh',
    paddingTop: '2rem',
  },
  exitBar: {
    position: 'fixed',
    top: '2rem',
    left: '2rem',
    zIndex: 100,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  subdomainTag: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#C5A059',
    marginBottom: '4px',
  },
  shieldBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    color: '#888888',
    padding: '0.4rem 1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
  },
  cardContainer: {
    maxWidth: '640px',
    margin: '2rem auto 6rem auto',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: 'clamp(1.8rem, 5vw, 3rem) clamp(1rem, 4vw, 2.5rem)',
    textAlign: 'center',
    boxSizing: 'border-box',
    width: '100%',
  },
  demoChipWrap: {
    marginTop: '0.9rem',
  },
  demoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
    border: '1px solid rgba(197, 160, 89, 0.28)',
    borderRadius: '9999px',
    padding: '0.45rem 1rem',
    fontSize: '0.78rem',
    color: '#D9D2C7',
    fontFamily: 'monospace',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: '0.5rem',
  },
  cardSub: {
    fontSize: '0.82rem',
    color: '#888888',
    lineHeight: '1.5',
    maxWidth: '460px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputWrapper: {
    width: '100%',
  },
  codeInput: {
    width: '100%',
    maxWidth: '100%',
    textAlign: 'center',
    fontSize: 'clamp(1.05rem, 4.4vw, 1.55rem)',
    fontFamily: 'monospace',
    letterSpacing: 'clamp(0.06em, 1.6vw, 0.18em)',
    padding: '1.1rem 0.5rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '16px',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  },
  errorAlert: {
    fontSize: '0.8rem',
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
  },
  progressWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: '#222222',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#C5A059',
    transition: 'width 0.15s linear',
  },
  progressText: {
    fontSize: '0.75rem',
    color: '#888888',
  },
  submitBtn: {
    width: '100%',
    padding: '1.1rem',
    fontSize: '0.95rem',
  },
  viewerContainer: {
    marginBottom: '6rem',
  },
  viewerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  templateTag: {
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    color: '#C5A059',
    textTransform: 'uppercase',
  },
  experienceTitle: {
    fontSize: '1.8rem',
    fontWeight: '300',
    color: '#FFFFFF',
  },
  webglCanvasContainer: {
    width: '100%',
    height: '560px',
    backgroundColor: '#0D0D0D',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
  },
  canvas3DCard: {
    width: '360px',
    height: '460px',
    backgroundColor: '#161616',
    border: '1px solid rgba(197, 160, 89, 0.4)',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(197, 160, 89, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    transform: 'rotateY(-8deg) rotateX(4deg)',
    transition: 'transform 0.4s ease',
  },
  foilBorder: {
    position: 'absolute',
    inset: '10px',
    border: '1px stroke rgba(197, 160, 89, 0.3)',
    pointerEvents: 'none',
    borderRadius: '12px',
  },
  canvasPhoto: {
    width: '100%',
    height: '55%',
    objectFit: 'cover',
  },
  card3DOverlay: {
    padding: '1.25rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
  },
  goldBrandLogo: {
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    color: '#C5A059',
  },
  canvasMessage: {
    fontSize: '0.85rem',
    color: '#E0E0E0',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  senderSign: {
    fontSize: '0.75rem',
    color: '#888888',
  },
  canvasControlsHint: {
    position: 'absolute',
    bottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#888888',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    backdropFilter: 'blur(8px)',
  },
};
