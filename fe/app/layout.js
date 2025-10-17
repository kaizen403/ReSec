import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hackazon - Your Premium Online Store",
  description: "Shop the latest products with amazing deals and fast shipping at Hackazon",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-200 bg-slate-950`}>
        <Providers>
          <div className="theme-shell relative min-h-screen overflow-x-hidden">
            <div className="theme-backdrop" aria-hidden="true" />
            <div className="theme-backdrop-secondary" aria-hidden="true" />
            <Navbar />
            <main className="relative z-10">{children}</main>
            <footer className="relative z-10 mt-20 py-10 border-t border-white/10 text-slate-400">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h5 className="text-lg font-semibold text-white">Hackazon</h5>
                    <p className="text-sm text-slate-400">Your premium online shopping destination</p>
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold text-white mb-2">Quick Links</h6>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                      <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                      <li><a href="/products" className="hover:text-white transition">Products</a></li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold text-white mb-2">Customer Service</h6>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li><a href="/orders" className="hover:text-white transition">Track Order</a></li>
                      <li><a href="/settings" className="hover:text-white transition">Settings</a></li>
                      <li><a href="/wishlist" className="hover:text-white transition">Wishlist</a></li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="text-sm font-semibold text-white mb-2">Business Tools</h6>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li><a href="/admin/catalog" className="hover:text-white transition">Catalog Import</a></li>
                      <li><a href="/tools/invoice-parser" className="hover:text-white transition">Invoice Parser</a></li>
                    </ul>
                  </div>
                </div>
                <hr className="my-6 border-white/10" />
                <p className="text-center text-sm text-slate-500">
                  © 2025 Hackazon. All rights reserved. | Built for security research purposes only.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
