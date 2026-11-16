'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  }, [pathname]);

  const isPathAdmin = pathname?.startsWith('/admin');
  const hidePortalLayout = isPathAdmin || isAdmin;

  if (hidePortalLayout) {
    // Admin routes render directly with their own dedicated admin header/navigation
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
