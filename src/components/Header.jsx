'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith('/admin') || (
    typeof window !== 'undefined' && (
      window.location.hostname.startsWith('admin.') || 
      window.location.hostname.includes('admin')
    )
  );

  if (isAdmin) {
    return null;
  }

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        <Link href="/" style={styles.brandLink}>
          <img
            src="/keepsake.svg"
            alt="The Keepsake Smith Logo"
            width="28"
            height="28"
            style={{ opacity: 0.9 }}
          />
          <span style={styles.brandText}>THE KEEPSAKE SMITH</span>
        </Link>
        <div style={styles.rightWrap}>
          <span style={styles.portalTag}>3D GIFT PORTAL</span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    width: '100%',
    padding: '1.25rem 0',
    backgroundColor: 'rgba(17, 17, 17, 0.65)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  brandText: {
    fontSize: '0.8rem',
    fontWeight: '300',
    letterSpacing: '0.14em',
    color: '#D9D2C7',
  },
  rightWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  portalTag: {
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    color: '#C5A059',
    fontWeight: '400',
    textTransform: 'uppercase',
  },
};
