'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

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

  return (
    <header style={styles.header}>
      <div className="container" style={styles.headerContainer}>
        {/* Left Spacer */}
        <div style={{ flex: 1 }} />

        {/* Navigation Items */}
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
  logoSvg: {
    transition: 'transform 0.4s ease',
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
  },
  navLink: {
    fontSize: '0.75rem',
    fontWeight: '400',
    letterSpacing: '0.12em',
    color: '#A0A0A0',
    transition: 'color 0.2s ease',
  },
  cartBtn: {
    fontSize: '0.75rem',
    fontWeight: '400',
    letterSpacing: '0.12em',
    color: '#FFFFFF',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};
