import './globals.css';
import Link from 'next/link';
import { Providers } from './providers';
import ThemeToggle from './components/ThemeToggle';
import HeaderCategoryDropdown from './components/HeaderCategoryDropdown';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from '@/components/ScrollToTop';
import ClientLayoutWrapper from './components/ClientLayoutWrapper';

export const metadata = {
  title: 'KaaliKahani | Professional Storytelling',
  description: 'Premium editorial narratives',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container transition-colors duration-500" suppressHydrationWarning>
        <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;700;800;900&family=Inter:wght@300;400;500;600&family=Pirata+One&family=Martel:wght@400;700;900&family=Noto+Serif+Devanagari:wght@400;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Toaster position="top-right" />
        <AuthProvider>
          <Providers>
            <ScrollToTop />
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
