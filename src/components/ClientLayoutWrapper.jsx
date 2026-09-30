'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const isPathAdmin = pathname?.startsWith('/admin');
      const isHostAdmin = typeof window !== 'undefined' && (
        window.location.hostname.startsWith('admin.') || 
        window.location.hostname.includes('admin')
      );
      setIsAdmin(Boolean(isPathAdmin || isHostAdmin));
    };

    checkAdmin();

    // Noticeable Smooth Scrolling Handler for internal anchors
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const elem = document.querySelector(href);
        if (elem) {
          e.preventDefault();
          elem.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [pathname]);

  const isPathAdmin = pathname?.startsWith('/admin');
  const hideStorefrontLayout = isPathAdmin || isAdmin;

  if (hideStorefrontLayout) {
    // Admin routes render ONLY the main dashboard page (which contains its own dedicated Admin Header)
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <CartDrawer />
      <Footer />
    </>
  );
}

