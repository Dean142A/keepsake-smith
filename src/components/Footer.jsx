'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
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
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.divider} />
        <div style={styles.contentRow}>
          <div style={styles.leftCol}>
            <span style={styles.brandTitle}>THE KEEPSAKE SMITH</span>
            <p style={styles.brandDesc}>
              We craft gifts that are truly memorable. Interactive 3D WebGL digital keepsake experiences paired with handcrafted cards.
            </p>
          </div>
          <div style={styles.rightCol}>
            <span style={styles.copyText}>© {new Date().getFullYear()} The Keepsake Smith. All rights reserved.</span>
            <span style={styles.supportText}>Assistance: <a href="mailto:support@thekeepsakesmith.com" style={styles.supportLink}>support@thekeepsakesmith.com</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: '100%',
    padding: '3rem 0 4rem 0',
    backgroundColor: '#111111',
    marginTop: 'auto',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: '2rem',
  },
  contentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  leftCol: {
    maxWidth: '460px',
  },
  brandTitle: {
    fontSize: '0.8rem',
    fontWeight: '400',
    letterSpacing: '0.14em',
    color: '#D9D2C7',
    display: 'block',
    marginBottom: '0.5rem',
  },
  brandDesc: {
    fontSize: '0.78rem',
    color: '#777777',
    lineHeight: '1.6',
    margin: 0,
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.4rem',
  },
  copyText: {
    fontSize: '0.75rem',
    color: '#666666',
  },
  supportText: {
    fontSize: '0.75rem',
    color: '#666666',
  },
  supportLink: {
    color: '#C5A059',
    textDecoration: 'none',
  },
};
