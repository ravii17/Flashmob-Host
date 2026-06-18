import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import AboutSidebar from '@/components/AboutSidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FlashMob Connect | Create & Join Local Flashmobs',
  description:
    'Discover, join, and organize exciting flashmob events happening in your local area. Connect with your community instantly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans min-h-screen antialiased`}>
        <Providers>
          {children}
          <AboutSidebar />
        </Providers>
      </body>
    </html>
  );
}
