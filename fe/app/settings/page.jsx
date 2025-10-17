'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [msg, setMsg] = useState('');
  const save = (text)=>{setMsg(text); setTimeout(()=>setMsg(''), 2500);};

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold">Settings</h1>
      {msg && (<div className="rounded border border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 p-3">{msg}</div>)}

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={(e)=>{e.preventDefault(); save('Password updated successfully!');}} className="rounded-xl border border-black/10 dark:border-white/10 p-6 space-y-3">
          <h5 className="font-semibold">🔒 Security</h5>
          <div><label className="block text-sm mb-1">Current Password</label><input type="password" className="w-full px-3 py-2 rounded border bg-background"/></div>
          <div><label className="block text-sm mb-1">New Password</label><input type="password" className="w-full px-3 py-2 rounded border bg-background"/></div>
          <div><label className="block text-sm mb-1">Confirm New Password</label><input type="password" className="w-full px-3 py-2 rounded border bg-background"/></div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white">Update Password</button>
        </form>

        <form onSubmit={(e)=>{e.preventDefault(); save('Notification preferences saved');}} className="rounded-xl border border-black/10 dark:border-white/10 p-6 space-y-3">
          <h5 className="font-semibold">🔔 Notifications</h5>
          {['Orders','Promotions','Shipping','Newsletter','Price drops'].map((l,i)=> (
            <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked={i<2}/> Email notifications for {l}</label>
          ))}
          <button className="px-4 py-2 rounded bg-blue-600 text-white">Save Preferences</button>
        </form>

        <form onSubmit={(e)=>{e.preventDefault(); save('Privacy settings saved');}} className="rounded-xl border border-black/10 dark:border-white/10 p-6 space-y-3">
          <h5 className="font-semibold">🔐 Privacy</h5>
          <div><label className="block text-sm mb-1">Profile Visibility</label><select className="w-full px-3 py-2 rounded border bg-background"><option>Public</option><option>Friends Only</option><option>Private</option></select></div>
          {['Show purchase history','Show wishlist publicly','Allow personalized recommendations'].map((l,i)=> (
            <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked={i>0}/> {l}</label>
          ))}
          <button className="px-4 py-2 rounded bg-blue-600 text-white">Save Settings</button>
        </form>

        <div className="rounded-xl border border-black/10 dark:border-white/10 p-6">
          <h5 className="font-semibold text-red-600">⚠️ Danger Zone</h5>
          <p className="text-sm text-foreground/70 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="px-4 py-2 rounded border border-red-500/40 text-red-600">Delete Account</button>
        </div>
      </div>
    </div>
  );
}







