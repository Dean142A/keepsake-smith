'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin routes do NOT render storefront Header, CartDrawer, or Footer
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
