'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    setMounted(true);
    const syncCart = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = saved.reduce((sum, i) => sum + (i.qty || 0), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    const syncSession = () => {
      try {
        const cached = JSON.parse(localStorage.getItem('sessionUser') || 'null');
        setUser(cached);
      } catch {
        setUser(null);
      }
    };

    const fetchSession = async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sessionUser', JSON.stringify(data));
            window.dispatchEvent(new Event('session-sync'));
          }
        } else if (res.status === 401) {
          setUser(null);
          localStorage.removeItem('sessionUser');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('session-sync'));
          }
        }
      } catch {
        // ignore network errors, navbar will rely on local cache
      }
    };

    syncCart();
    syncSession();
    fetchSession();

    const handleStorage = (event) => {
      if (!event.key || ['cart', 'sessionUser'].includes(event.key)) {
        syncCart();
        syncSession();
      }
    };

    const handleSessionSync = () => syncSession();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('session-sync', handleSessionSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('session-sync', handleSessionSync);
    };
  }, []);

  const handleLogout = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    try {
      fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    localStorage.removeItem('sessionUser');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('session-sync'));
    }
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded hover:bg-white/10"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
            <Link href="/" className="text-xl font-bold">
              Hackazon
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-slate-300">
            <Link href="/products" className="text-sm hover:text-sky-300 transition">Products</Link>
            <Link href="/search" className="text-sm hover:text-sky-300 transition">Search</Link>
            <Link href="/invoices" className="text-sm hover:text-sky-300 transition">Invoices</Link>
            <Link href="/about" className="text-sm hover:text-sky-300 transition">About</Link>
            <Link href="/contact" className="text-sm hover:text-sky-300 transition">Contact</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative inline-flex items-center gap-1 px-3 py-2 rounded border border-white/10 hover:bg-white/10 text-sm text-slate-200">
              <span>🛒</span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1">{cartCount}</span>
              )}
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-2 rounded border border-white/10 hover:bg-white/10 text-sm text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="px-3 py-2 rounded border border-white/10 hover:bg-white/10 text-sm text-slate-200"
                  >
                    {user?.displayName || user?.username || 'Profile'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded border border-white/10 hover:bg-white/10 text-sm text-slate-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-2 rounded hover:bg-white/10 text-sm text-slate-200">Login</Link>
                  <Link href="/register" className="px-3 py-2 rounded border border-white/10 hover:bg-white/10 text-sm text-slate-200">Sign up</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {open && (
          <div className="md:hidden pb-3 space-y-2">
            <Link href="/products" className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200" onClick={() => setOpen(false)}>Products</Link>
            <Link href="/search" className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200" onClick={() => setOpen(false)}>Search</Link>
            <Link href="/about" className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200" onClick={() => setOpen(false)}>Contact</Link>
            <div className="h-px bg-white/10" />
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-white/10 text-slate-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/register" className="block px-3 py-2 rounded hover:bg-white/10 text-slate-200" onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
