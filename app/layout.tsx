import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from "@/components/sidebar";
import { NavbarWithTitle } from "@/components/navbar-with-title";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NyayMitra',
  description: 'Connecting legal advocates worldwide',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 transition-all duration-300 ml-[var(--sidebar-width,16rem)] flex flex-col">
            <NavbarWithTitle />
            <div className="flex-1">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
