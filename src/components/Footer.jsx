'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.navRow}>
          <div style={styles.leftNav}>
            <Link href="/#services" style={styles.link}>SERVICES</Link>
            <Link href="/shop" style={styles.link}>SHOP</Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.link}>INSTAGRAM</a>
            <Link href="/customize" style={styles.link}>CUSTOM</Link>
            <Link href="/cart" style={styles.link}>CART(0)</Link>
          </div>
          <div style={styles.rightNav}>
            <Link href="/#privacy" style={styles.link}>PRIVACY</Link>
            <Link href="/#cookies" style={styles.link}>COOKIES</Link>
            <Link href="/#returns" style={styles.link}>RETURNS</Link>
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
