import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '../components/layout/sidebar';
import { Toaster } from '../components/ui/toaster';
import './global.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Previ',
  description: 'Personal finance management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-y-auto bg-background">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
