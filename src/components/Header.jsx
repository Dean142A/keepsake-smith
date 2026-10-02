'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const isHomepage = pathname === '/';

  const isAdmin = pathname?.startsWith('/admin') || (
    typeof window !== 'undefined' && (
      window.location.hostname.startsWith('admin.') || 
      window.location.hostname.includes('admin')
    )
  );

  const isPortal = pathname?.startsWith('/portal') || (
    typeof window !== 'undefined' && (
      window.location.hostname.startsWith('app.') ||
      window.location.hostname.includes('app.')
    )
  );

  if (isAdmin || isPortal) {
    return null;
  }

  if (isHomepage) {
    return (
      <header style={styles.homepageHeader}>
        <div className="container" style={styles.homepageHeaderContainer}>
          {/* Left Column: Hero Title */}
          <div style={styles.heroTitleCol}>
            <h1 className="heading-xl" style={styles.heroTitle}>
              <span style={{ color: '#989898' }}>we craft gifts that <br />are </span>
              <span style={{ color: '#D9D2C7' }}>memorable.</span>
            </h1>
          </div>

          {/* Right Column: Navbar Links & Emblem Badge */}
          <div style={styles.headerRightCol}>
            <nav style={styles.nav}>
              <Link href="/#services" style={styles.navLink}>
                SERVICES
              </Link>
              <Link href="/shop" style={styles.navLink}>
                SHOP
              </Link>
              <Link href="/customize" style={styles.navLink}>
                CUSTOM
              </Link>
              <Link href="/track" style={styles.navLink}>
                TRACK
              </Link>
              <Link href="/faq" style={styles.navLink}>
                FAQ
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                style={styles.cartBtn}
                aria-label="View Bag"
              >
                CART({cartCount})
              </button>
            </nav>

            <div style={styles.emblemBadge}>
              <img
                src="/keepsake.svg"
                alt="Keepsake Logo"
                width="36"
                height="36"
                style={{ flexShrink: 0, opacity: 0.85 }}
              />
              <p style={styles.emblemSubtext}>
                this explains color systems and color usages so they are used the way to brand identity portrays
              </p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header style={styles.header}>
      <div className="container" style={styles.headerContainer}>
        {/* Left: Brand Logo / Text Link */}
        <Link href="/" style={styles.logoLink}>
          <span style={styles.logoText}>the keepsake smith</span>
        </Link>

        {/* Right Navigation Items */}
        <nav style={styles.nav}>
          <Link href="/#services" style={styles.navLink}>
            SERVICES
          </Link>
          <Link href="/shop" style={styles.navLink}>
            SHOP
          </Link>
          <Link href="/customize" style={styles.navLink}>
            CUSTOM
          </Link>
          <Link href="/track" style={styles.navLink}>
            TRACK
          </Link>
          <Link href="/faq" style={styles.navLink}>
            FAQ
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            style={styles.cartBtn}
            aria-label="View Bag"
          >
            CART({cartCount})
          </button>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  homepageHeader: {
    width: '100%',
    paddingTop: '20px',
    paddingBottom: '1rem',
    position: 'relative',
    zIndex: 90,
  },
  homepageHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  heroTitleCol: {
    flex: '1 1 480px',
    maxWidth: '720px',
  },
  heroTitle: {
    margin: 0,
    padding: 0,
  },
  headerRightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '1.8rem',
    flex: '0 0 auto',
  },
  header: {
    width: '100%',
    padding: '1.5rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 90,
    backgroundColor: 'rgba(17, 17, 17, 0.85)',
    backdropFilter: 'blur(12px)',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#FFFFFF',
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '0.95rem',
    fontWeight: '300',
    letterSpacing: '0.08em',
    textTransform: 'lowercase',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    paddingTop: '0.3rem',
  },
  navLink: {
    fontSize: '0.75rem',
    fontWeight: '300',
    letterSpacing: '0.12em',
    color: '#C9C9C9',
    transition: 'color 0.2s ease',
  },
  cartBtn: {
    fontSize: '0.75rem',
    fontWeight: '300',
    letterSpacing: '0.12em',
    color: '#C9C9C9',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  emblemBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    maxWidth: '280px',
  },
  emblemSubtext: {
    fontSize: '0.7rem',
    color: '#888888',
    lineHeight: '1.4',
  },
};

