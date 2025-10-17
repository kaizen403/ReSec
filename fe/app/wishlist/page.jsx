'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([
    { id: 1, name: 'Premium Headphones', priceCents: 9999, imageUrl: 'https://placehold.co/300x300/3b82f6/fff?text=HP', category: 'Electronics', inStock: true },
    { id: 2, name: 'Smart Watch', priceCents: 29999, imageUrl: 'https://placehold.co/300x300/8b5cf6/fff?text=Watch', category: 'Electronics', inStock: true },
    { id: 3, name: 'Laptop Stand', priceCents: 4999, imageUrl: 'https://placehold.co/300x300/10b981/fff?text=Stand', category: 'Accessories', inStock: false },
    { id: 4, name: 'Wireless Mouse', priceCents: 2999, imageUrl: 'https://placehold.co/300x300/f59e0b/fff?text=Mouse', category: 'Electronics', inStock: true }
  ]);

  const remove = (id) => setWishlist(wishlist.filter(i=> i.id!==id));

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-3">❤️</div>
        <h4 className="text-xl font-semibold mb-2">Your wishlist is empty</h4>
        <p className="text-foreground/70 mb-4">Save items you like to buy them later</p>
        <Link href="/products" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">My Wishlist</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((i)=> (
          <div key={i.id} className="relative rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
            <button onClick={()=>remove(i.id)} className="absolute top-2 right-2 text-red-600">✕</button>
            <div className="relative pt-[100%]">
              <img src={i.imageUrl} alt={i.name} className="absolute inset-0 w-full h-full object-cover" />
              {!i.inStock && (
                <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/70 text-white">Out of Stock</span>
              )}
            </div>
            <div className="p-4">
              <div className="text-xs inline-block px-2 py-1 rounded bg-black/5 dark:bg-white/10 mb-1">{i.category}</div>
              <h3 className="text-sm font-semibold mb-2 line-clamp-2">
                <Link href={`/product/${i.id}`} className="hover:underline">{i.name}</Link>
              </h3>
              <div className="text-blue-600 dark:text-blue-400 font-semibold mb-3">${(i.priceCents/100).toFixed(2)}</div>
              <div className="grid gap-2">
                <button disabled={!i.inStock} className={`px-3 py-2 rounded ${i.inStock ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-black/10 dark:bg-white/10 text-foreground/60'}`}>{i.inStock?'Add to Cart':'Notify Me'}</button>
                <Link href={`/product/${i.id}`} className="px-3 py-2 rounded border border-black/10 dark:border-white/10 text-center">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}







