import './globals.css';
import { CartProvider } from '@/context/CartContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  title: 'The Keepsake Smith | Custom 3D & Physical Keepsake Experience',
  description: 'We craft gifts that are memorable. Personalized 3D WebGL experiences and custom handcrafted keepsake cards.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
