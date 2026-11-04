'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Footer() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

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
    <footer style={styles.footer} className="mobile-footer-wrap">
      <div className="container">
        {/* =========================================================
            MOBILE FOOTER (Figma Home-1.png strictly matched)
            ========================================================= */}
        <div className="mobile-only">
          <div
            className="mobile-footer-nav-1"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}
          >
            <Link href={`${mainSite}/#services`} className="mobile-footer-link">
              SERVICES
            </Link>
            <Link href={`${mainSite}/shop`} className="mobile-footer-link">
              SHOP
            </Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="mobile-footer-link">
              INSTAGRAM
            </a>
            <Link href={`${mainSite}/customize`} className="mobile-footer-link">
              CUSTOM
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="mobile-footer-link"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label="View Bag"
            >
              CART({cartCount})
            </button>
          </div>

          <div
            className="mobile-footer-nav-2"
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '2rem', width: '100%', marginBottom: '2rem' }}
          >
            <Link href={`${mainSite}/#privacy`} className="mobile-footer-link">
              PRIVACY
            </Link>
            <Link href={`${mainSite}/#cookies`} className="mobile-footer-link">
              COOKIES
            </Link>
            <Link href={`${mainSite}/#returns`} className="mobile-footer-link">
              RETURNS
            </Link>
          </div>

          <div style={styles.divider} />

          <div className="mobile-footer-disclaimer">
            this explains color systems and color usages so they are used the way to brand identity portrays this explains color
            systems and color usages so they are used the way to brand identity portrays this explains color systems and color
            usages so they are used the way to brand identity portrays this explains color systems and color usages so they are
            used the....systems and color usages so they are used the.
          </div>
        </div>

        {/* =========================================================
            DESKTOP FOOTER (Figma Home.png strictly matched)
            ========================================================= */}
        <div className="desktop-only">
          <div style={styles.navRow}>
            {/* Left Nav: SERVICES, SHOP, INSTAGRAM, CUSTOM, CART(0) */}
            <div style={styles.leftNav}>
              <Link href={`${mainSite}/#services`} style={styles.link}>
                SERVICES
              </Link>
              <Link href={`${mainSite}/shop`} style={styles.link}>
                SHOP
              </Link>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.link}>
                INSTAGRAM
              </a>
              <Link href={`${mainSite}/customize`} style={styles.link}>
                CUSTOM
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                style={styles.cartBtn}
                aria-label="View Bag"
              >
                CART({cartCount})
              </button>
            </div>

            {/* Right Nav: PRIVACY, COOKIES, RETURNS */}
            <div style={styles.rightNav}>
              <Link href={`${mainSite}/#privacy`} style={styles.link}>
                PRIVACY
              </Link>
              <Link href={`${mainSite}/#cookies`} style={styles.link}>
                COOKIES
              </Link>
              <Link href={`${mainSite}/#returns`} style={styles.link}>
                RETURNS
              </Link>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.disclaimerText}>
            this explains color systems and color usages so they are used the way to brand identity portrays this explains color
            systems and color usages so they are used the way to brand identity portrays this explains color systems and color
            usages so they are used the way to brand identity portrays this explains color systems and color usages so they are
            used the....systems and color usages so they are used the.
          </div>
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
    alignItems: 'center',
    gap: '2.5rem',
    flexWrap: 'wrap',
  },
  rightNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
    flexWrap: 'wrap',
  },
  link: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  },
  cartBtn: {
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    fontWeight: '300',
    transition: 'color 0.2s ease',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: '2rem',
  },
  disclaimerText: {
    fontSize: '0.72rem',
    color: '#444444',
    lineHeight: '1.6',
    maxWidth: '820px',
  },
};
