'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
          displayName: `${firstName} ${lastName}`.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionUser', JSON.stringify({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          displayName: `${firstName} ${lastName}`.trim() || data.username,
        }));
        window.dispatchEvent(new Event('session-sync'));
      }

      setSuccess(true);
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-8">
          <div className="text-6xl mb-3">✅</div>
          <h3 className="text-xl font-bold mb-2">Account Created!</h3>
          <p className="text-foreground/70 mb-4">You can now sign in and start shopping.</p>
          <Link href="/login" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 inline-block">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold mb-2">Create Account</h1>
        <p className="text-foreground/70">Join Hackazon and start shopping today</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 p-3">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid md:grid-cols-2 gap-3"
      >
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input name="firstName" required className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input name="lastName" required className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input name="username" required className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input name="email" type="email" required className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input name="password" type="password" required className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input name="confirmPassword" type="password" required className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        </div>
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" required /> I agree to the Terms and Privacy</label>
        </div>
        <div className="md:col-span-2">
          <button disabled={loading} className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50">{loading ? 'Creating…' : 'Create Account'}</button>
        </div>
        <div className="md:col-span-2 text-center text-sm">
          <span className="text-foreground/70">Already have an account? </span>
          <Link href="/login" className="font-semibold hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
