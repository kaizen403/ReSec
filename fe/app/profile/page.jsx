'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [success, setSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
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
          router.replace('/login');
        } else {
          const body = await res.json().catch(() => ({}));
          setProfileError(body.error || 'Unable to load profile');
        }
      } catch (err) {
        setProfileError(err.message || 'Unable to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    if (!user || formData) {
      return;
    }

    const baseAddress = {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States'
    };

    if (user.displayName) {
      const parts = user.displayName.split(' ');
      setFormData({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName,
        bio: '',
        address: baseAddress
      });
      return;
    }

    setFormData({
      firstName: user.username || '',
      lastName: '',
      username: user.username || '',
      email: user.email || '',
      displayName: user.displayName || user.username || '',
      bio: '',
      address: baseAddress
    });
  }, [user, formData]);

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    if (!filename.trim()) {
      setUploadError('Please enter a filename');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/upload/profile-picture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: filename,
          content: 'profile_picture_data',
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { raw: text };
      }

      setUploadResult({
        status: response.status,
        data,
      });

      if (!response.ok && data && typeof data === 'object' && data.error) {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-sm text-foreground/70">Loading your profile...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="rounded border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 p-4 text-center">
          {profileError}
        </div>
      </div>
    );
  }

  if (!user || !formData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 text-center space-y-3">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto text-5xl flex items-center justify-center mb-1">
          {(user.displayName || user.username || '👤').charAt(0).toUpperCase()}
        </div>
        <div>
          <h5 className="font-semibold">{formData.displayName || user.username}</h5>
          <p className="text-sm text-foreground/70">{formData.email}</p>
        </div>
        <form onSubmit={handleProfilePictureUpload} className="w-full space-y-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="avatar.jpg"
            className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background text-sm"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Picture'}
          </button>
        </form>
        <button className="w-full px-3 py-2 rounded border border-red-500/40 text-red-600 hover:bg-red-500/10">
          Delete Account
        </button>
      </div>

      <div className="md:col-span-2 space-y-6">
        {success && (
          <div className="rounded border border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 p-3">
            Profile updated successfully!
          </div>
        )}

        {uploadError && (
          <div className="rounded border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 p-3">
            <strong>Upload Error:</strong> {uploadError}
          </div>
        )}

        {uploadResult && (
          <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 space-y-2">
            <h4 className="font-semibold">Upload Result</h4>
            <p className="text-xs text-foreground/60">Status: {uploadResult.status}</p>
            <pre className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono p-3 rounded border border-gray-200 dark:border-gray-700 text-xs overflow-auto max-h-48 whitespace-pre-wrap">
{typeof uploadResult.data === 'string'
  ? uploadResult.data
  : (uploadResult.data && uploadResult.data.raw)
    ? uploadResult.data.raw
    : JSON.stringify(uploadResult.data, null, 2)}
            </pre>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const updatedUser = {
              ...user,
              username: formData.username,
              email: formData.email,
              displayName: formData.displayName || formData.username
            };
            setUser(updatedUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem('sessionUser', JSON.stringify(updatedUser));
              window.dispatchEvent(new Event('session-sync'));
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
          }}
          className="rounded-xl border border-black/10 dark:border-white/10 p-6 space-y-3"
        >
          <h4 className="font-semibold">Personal Information</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">First Name</label>
              <input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <input
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell us a bit about yourself"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
            />
          </div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
            Save Changes
          </button>
        </form>

        <form className="rounded-xl border border-black/10 dark:border-white/10 p-6 space-y-3">
          <h4 className="font-semibold">Shipping Address</h4>
          <div>
            <label className="block text-sm mb-1">Street Address</label>
            <input
              placeholder="123 Main St"
              value={formData.address.street}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
            />
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">City</label>
              <input
                placeholder="New York"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">State</label>
              <input
                placeholder="NY"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
                className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">ZIP</label>
              <input
                placeholder="10001"
                value={formData.address.zip}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zip: e.target.value }
                })}
                className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Country</label>
            <select
              value={formData.address.country}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, country: e.target.value }
              })}
              className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Save Address</button>
        </form>
      </div>
    </div>
  );
}
