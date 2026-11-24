/**
 * Admin route layout.
 *
 * Importing admin.css here — rather than in globals.css — is what keeps the
 * Tailwind build confined to /admin. The storefront never loads this file.
 */
import './admin.css';

export const metadata = {
  title: 'Keepsake Ops — Admin Console',
  description: 'Internal order, catalog and access-code management.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
