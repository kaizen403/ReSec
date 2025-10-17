'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReviewsPage() {
  const [tab, setTab] = useState('pending');
  const pending = [
    { id: 1, productId: 123, productName: 'Premium Headphones', orderId: 456, imageUrl: 'https://placehold.co/100x100/3b82f6/fff?text=HP' },
    { id: 2, productId: 124, productName: 'Smart Watch', orderId: 456, imageUrl: 'https://placehold.co/100x100/8b5cf6/fff?text=Watch' }
  ];
  const mine = [
    { id: 3, productId: 125, productName: 'Laptop Stand', rating: 5, text: 'Excellent product! Very sturdy and well-made.', date: '2025-01-10', imageUrl: 'https://placehold.co/100x100/10b981/fff?text=Stand' },
    { id: 4, productId: 126, productName: 'Wireless Mouse', rating: 4, text: 'Good mouse, comfortable to use.', date: '2025-01-05', imageUrl: 'https://placehold.co/100x100/f59e0b/fff?text=Mouse' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">My Reviews</h1>
      <div className="mb-6 flex gap-2">
        <button onClick={()=>setTab('pending')} className={`px-3 py-2 rounded border ${tab==='pending'?'bg-blue-600 text-white':'border-black/10 dark:border-white/10'}`}>Pending Reviews ({pending.length})</button>
        <button onClick={()=>setTab('published')} className={`px-3 py-2 rounded border ${tab==='published'?'bg-blue-600 text-white':'border-black/10 dark:border-white/10'}`}>My Reviews ({mine.length})</button>
      </div>

      {tab==='pending' ? (
        pending.length === 0 ? (
          <div className="text-center rounded-xl border border-black/10 dark:border-white/10 p-10">
            <div className="text-6xl mb-2">⭐</div>
            <h4 className="text-lg font-semibold mb-1">No pending reviews</h4>
            <p className="text-foreground/70 mb-3">Purchase products to leave reviews</p>
            <Link href="/products" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(r => (
              <div key={r.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <img src={r.imageUrl} className="w-16 h-16 rounded object-cover col-span-2" />
                  <div className="col-span-8">
                    <Link href={`/product/${r.productId}`} className="font-semibold hover:underline">{r.productName}</Link>
                    <div className="text-sm text-foreground/70">Order #{r.orderId}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Write Review</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {mine.map(r => (
            <div key={r.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
              <div className="grid grid-cols-12 gap-3">
                <img src={r.imageUrl} className="w-16 h-16 rounded object-cover col-span-2" />
                <div className="col-span-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/product/${r.productId}`} className="font-semibold hover:underline">{r.productName}</Link>
                      <div className="text-amber-500">{'⭐'.repeat(r.rating)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-foreground/70">{r.date}</div>
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-700 dark:text-green-300">Published</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2">{r.text}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-2 rounded border border-black/10 dark:border-white/10">Edit</button>
                    <button className="px-3 py-2 rounded border border-red-500/40 text-red-600">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







