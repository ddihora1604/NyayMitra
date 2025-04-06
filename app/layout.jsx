import './globals.css';
import { Inter } from 'next/font/google';
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NyayMitra',
  description: 'Connecting legal advocates worldwide',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 transition-all duration-300 ml-[var(--sidebar-width,16rem)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 