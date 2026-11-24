'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
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
            {/* Header Brand Row */}
            <div style={styles.headerRow}>
              <div>
                <span style={styles.subdomainTag}>THE KEEPSAKE SMITH</span>
                <h1 className="heading-xl">3D Keepsake Portal</h1>
              </div>
              <div style={styles.shieldBadge}>
                <ShieldCheck size={14} color="#C5A059" />
                <span>3-Day Experience Vault</span>
              </div>
            </div>

            {/* Access Code Input Card */}
            <div style={styles.cardContainer}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Enter Your 12-Character Access Code</h2>
                <p style={styles.cardSub}>
                  Enter the access code printed on your physical keepsake card or received in your gift email to launch your interactive 3D WebGL experience.
                </p>
              </div>

              <form onSubmit={handleRedeem} style={styles.form}>
                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    maxLength={16}
                    value={code}
                    onChange={(e) => handleFormatCode(e.target.value)}
                    placeholder="KPSK-XXXX-XXXX"
                    style={styles.codeInput}
                    disabled={loading}
                    autoComplete="off"
                    spellCheck="false"
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
                      <RefreshCw size={16} className="spin" style={{ marginRight: '8px' }} /> Unlocking...
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
            order={experienceData}
            personalization={experienceData.personalization}
            onExit={() => setExperienceData(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', padding: '4rem', textAlign: 'center', color: '#FFF' }}>Loading 3D Keepsake Portal...</div>}>
      <PortalContent />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: '85vh',
    paddingTop: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  subdomainTag: {
    fontSize: '0.75rem',
    letterSpacing: '0.14em',
    color: '#C5A059',
    display: 'block',
    marginBottom: '6px',
    fontWeight: '400',
  },
  shieldBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    color: '#888888',
    padding: '0.45rem 1.1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  cardContainer: {
    maxWidth: '640px',
    margin: '1.5rem auto 5rem auto',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: 'clamp(1.8rem, 5vw, 3rem) clamp(1rem, 4vw, 2.5rem)',
    textAlign: 'center',
    boxSizing: 'border-box',
    width: '100%',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: 'clamp(1.2rem, 3.5vw, 1.45rem)',
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
    fontSize: '0.82rem',
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.25)',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    lineHeight: '1.5',
    textAlign: 'center',
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
    backgroundColor: '#C5A059',
    color: '#000000',
    border: 'none',
    borderRadius: '9999px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
};
