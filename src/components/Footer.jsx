'use client';

import React from 'react';
import Link from 'next/link';
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

  // Determine main website URL base when hosted on app subdomain or /portal
  const isPortal = pathname?.startsWith('/portal') || (
    typeof window !== 'undefined' && (
      window.location.hostname.startsWith('app.') ||
      window.location.hostname.includes('app.')
    )
  );

  const mainSite = isPortal ? 'https://thekeepsakesmith.com' : '';

  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.navRow}>
          <div style={styles.leftNav}>
            <a href={`${mainSite}/#services`} style={styles.link}>SERVICES</a>
            <a href={`${mainSite}/shop`} style={styles.link}>SHOP</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.link}>INSTAGRAM</a>
            <a href={`${mainSite}/customize`} style={styles.link}>CUSTOM</a>
            <a href={`${mainSite}/cart`} style={styles.link}>CART(0)</a>
          </div>
          <div style={styles.rightNav}>
            <a href={`${mainSite}/#privacy`} style={styles.link}>PRIVACY</a>
            <a href={`${mainSite}/#cookies`} style={styles.link}>COOKIES</a>
            <a href={`${mainSite}/#returns`} style={styles.link}>RETURNS</a>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.disclaimerText}>
          this explains color systems and color usages so they are used the way to brand identity portrays.
          systems and color usages so they are used the way to brand identity portrays.
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: '100%',
    padding: '5rem 0 3rem 0',
    backgroundColor: 'transparent',
    marginTop: '6rem',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  leftNav: {
    display: 'flex',
    gap: '2.2rem',
    flexWrap: 'wrap',
  },
  rightNav: {
    display: 'flex',
    gap: '2.2rem',
    flexWrap: 'wrap',
  },
  link: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    transition: 'color 0.2s ease',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: '2rem',
  },
  disclaimerText: {
    fontSize: '0.72rem',
    color: '#444444',
    lineHeight: '1.6',
    maxWidth: '800px',
  },
};
