import './globals.css';
import { CartProvider } from '@/context/CartContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  metadataBase: new URL('https://thekeepsakesmith.com'),
  title: {
    default: 'The Keepsake Smith | Custom 3D & Handcrafted Physical Keepsakes',
    template: '%s | The Keepsake Smith',
  },
  description:
    'We craft gifts that are truly memorable. Personalized 3D WebGL digital experiences paired with custom handcrafted keepsake cards.',
  keywords: [
    'keepsake cards',
    '3D gift cards',
    'handcrafted physical cards',
    '3D WebGL experience',
    'luxury personalized gifts',
    'custom greeting cards',
    'access code 3D portal',
  ],
  authors: [{ name: 'The Keepsake Smith', url: 'https://thekeepsakesmith.com' }],
  creator: 'The Keepsake Smith',
  publisher: 'The Keepsake Smith',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'The Keepsake Smith | Custom 3D & Physical Keepsake Experience',
    description:
      'We craft gifts that are memorable. Personalized 3D WebGL digital gift experiences and custom handcrafted physical keepsake cards.',
    url: 'https://thekeepsakesmith.com',
    siteName: 'The Keepsake Smith',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Keepsake Smith - Handcrafted Keepsakes & 3D Experiences',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Keepsake Smith | Custom 3D & Physical Keepsakes',
    description:
      'Personalized 3D WebGL digital experiences paired with custom handcrafted physical keepsake cards.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Keepsake Smith',
    url: 'https://thekeepsakesmith.com',
    logo: 'https://thekeepsakesmith.com/og-image.png',
    description:
      'Personalized 3D WebGL gift experiences paired with custom handcrafted physical keepsake cards.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'orders@thekeepsakesmith.com',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body>
        <CartProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
