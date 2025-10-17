'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || 'null');
      if (saved) setItems(saved);
      else setItems([
        { id: 1, name: 'Premium Headphones', priceCents: 9999, qty: 1, imageUrl: 'https://placehold.co/100x100/3b82f6/fff?text=HP' },
        { id: 2, name: 'Smart Watch', priceCents: 29999, qty: 2, imageUrl: 'https://placehold.co/100x100/8b5cf6/fff?text=Watch' }
      ]);
    } catch {}
  }, []);

  const updateQty = (id, q) => {
    const updated = items.map(i => i.id === id ? { ...i, qty: Math.max(1, q) } : i);
    setItems(updated); localStorage.setItem('cart', JSON.stringify(updated));
  };
  const remove = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated); localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = items.reduce((s,i)=> s + i.priceCents*i.qty, 0);
  const shipping = 999; const tax = Math.floor(subtotal*0.08); const total = subtotal+shipping+tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-3">🛒</div>
        <h4 className="text-xl font-semibold mb-2">Your cart is empty</h4>
        <p className="text-foreground/70 mb-4">Add some products to get started</p>
        <Link href="/products" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-xl border border-black/10 dark:border-white/10 p-4 divide-y divide-black/10 dark:divide-white/10">
        {items.map(i => (
          <div key={i.id} className="py-3 grid grid-cols-12 items-center gap-3">
            <img src={i.imageUrl} alt={i.name} className="w-16 h-16 rounded object-cover col-span-2" />
            <div className="col-span-6">
              <Link href={`/product/${i.id}`} className="font-semibold hover:underline">{i.name}</Link>
              <div className="text-sm text-foreground/70">${(i.priceCents/100).toFixed(2)} each</div>
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <button onClick={()=>updateQty(i.id, i.qty-1)} className="px-2 py-1 rounded border">-</button>
              <input readOnly value={i.qty} className="w-12 text-center px-2 py-1 rounded border" />
              <button onClick={()=>updateQty(i.id, i.qty+1)} className="px-2 py-1 rounded border">+</button>
            </div>
            <div className="col-span-1 text-right font-semibold">${((i.priceCents*i.qty)/100).toFixed(2)}</div>
            <button onClick={()=>remove(i.id)} className="col-span-1 text-right text-red-600">🗑️</button>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 h-fit">
        <h5 className="font-semibold mb-3">Order Summary</h5>
        <div className="flex justify-between mb-1 text-sm"><span>Subtotal</span><span>${(subtotal/100).toFixed(2)}</span></div>
        <div className="flex justify-between mb-1 text-sm"><span>Shipping</span><span>${(shipping/100).toFixed(2)}</span></div>
        <div className="flex justify-between mb-2 text-sm"><span>Tax</span><span>${(tax/100).toFixed(2)}</span></div>
        <hr className="my-2" />
        <div className="flex justify-between mb-3 font-semibold"><span>Total</span><span>${(total/100).toFixed(2)}</span></div>
        <Link href="/checkout" className="block w-full text-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Proceed to Checkout</Link>
      </div>
    </div>
  );
}






