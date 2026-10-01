'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight, Copy } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const queryCode = searchParams?.get('code');
  const queryOrderId = searchParams?.get('orderId');

  const [accessCode, setAccessCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (queryCode) {
      setAccessCode(queryCode.toUpperCase());
    } else {
      // Fallback 12-char access code generator
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = 'KPSK-';
      for (let i = 0; i < 8; i++) {
        if (i === 4) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setAccessCode(code);
    }
  }, [queryCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.page}>
      <div className="container" style={styles.centerContainer}>
        {/* Envelope Icon */}
        <div style={styles.iconWrapper}>
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <rect x="15" y="25" width="70" height="50" rx="12" stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M15 32 L50 55 L85 32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="heading-xl" style={styles.title}>
          Your Order is being <br />
          processed
        </h1>

        <p style={styles.subtext}>
          Thank you for your order with The Keepsake Smith. Your personalized experience is being assembled by our artisan team.
        </p>

        {/* Generated Access Code Card */}
        {accessCode && (
          <div style={styles.codeCard}>
            <div style={styles.codeHeader}>
              <span style={styles.codeLabel}>YOUR 12-CHAR 3D EXPERIENCE ACCESS CODE</span>
              <span style={styles.statusBadge}>
                <CheckCircle2 size={12} color="#C5A059" /> READY
              </span>
            </div>
            
            <div style={styles.codeDisplayRow}>
              <span style={styles.codeString}>{accessCode}</span>
              <button onClick={handleCopy} className="btn-pill" style={{ padding: '0.4rem 1rem' }}>
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <p style={styles.codeHelp}>
              Use this unique code at <strong>app.thekeepsakesmith.com</strong> (Portal) to unlock your custom 3D WebGL experience.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.btnRow}>
          <Link href="/" className="btn-pill btn-pill-dark" style={{ padding: '0.8rem 2.2rem' }}>
            Back to Home
          </Link>
          <Link href="/portal" className="btn-pill btn-pill-solid" style={{ padding: '0.8rem 2.2rem' }}>
            Enter 3D Portal <ArrowRight size={14} style={{ marginLeft: '6px' }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#FFF' }}>Loading order details...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    padding: '4rem 0',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '720px',
    margin: '0 auto',
  },
  iconWrapper: {
    marginBottom: '2rem',
    opacity: 0.9,
  },
  title: {
    lineHeight: '1.15',
    marginBottom: '1.25rem',
  },
  subtext: {
    fontSize: '0.85rem',
    color: '#888888',
    lineHeight: '1.6',
    maxWidth: '520px',
    marginBottom: '3rem',
  },
  codeCard: {
    width: '100%',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2.5rem',
    textAlign: 'left',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  codeLabel: {
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    color: '#888888',
  },
  statusBadge: {
    fontSize: '0.7rem',
    color: '#C5A059',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  codeDisplayRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '0.85rem 1.25rem',
    marginBottom: '1rem',
  },
  codeString: {
    fontSize: '1.4rem',
    fontFamily: 'monospace',
    letterSpacing: '0.15em',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  codeHelp: {
    fontSize: '0.78rem',
    color: '#777777',
    lineHeight: '1.4',
  },
  btnRow: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
};
