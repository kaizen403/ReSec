'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const cartItems = [
    { id: 1, name: 'Premium Headphones', priceCents: 9999, qty: 1 },
    { id: 2, name: 'Smart Watch', priceCents: 29999, qty: 2 }
  ];
  const subtotal = cartItems.reduce((s,i)=> s+i.priceCents*i.qty,0);
  const shipping = 999; const tax = Math.floor(subtotal*0.08); const total = subtotal+shipping+tax;

  return (
    <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          {[1,2,3].map(s => (
            <div key={s} className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${step>=s?'bg-blue-600 text-white':'bg-black/5 dark:bg-white/10'}`}>{s}</div>
              <div className="text-xs mt-1">{['Shipping','Payment','Review'][s-1]}</div>
            </div>
          ))}
        </div>

        {step===1 && (
          <form onSubmit={(e)=>{e.preventDefault(); setStep(2);}} className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid md:grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1">First Name</label><input required className="w-full px-3 py-2 rounded border bg-background"/></div>
            <div><label className="block text-sm mb-1">Last Name</label><input required className="w-full px-3 py-2 rounded border bg-background"/></div>
            <div className="md:col-span-2"><label className="block text-sm mb-1">Email</label><input type="email" required className="w-full px-3 py-2 rounded border bg-background"/></div>
            <div className="md:col-span-2"><label className="block text-sm mb-1">Address</label><input required className="w-full px-3 py-2 rounded border bg-background"/></div>
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Continue to Payment</button>
          </form>
        )}

        {step===2 && (
          <form onSubmit={(e)=>{e.preventDefault(); setStep(3);}} className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><label className="block text-sm mb-1">Card Number</label><input required placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 rounded border bg-background"/></div>
            <div><label className="block text-sm mb-1">Name on Card</label><input required className="w-full px-3 py-2 rounded border bg-background"/></div>
            <div><label className="block text-sm mb-1">Expiry</label><input required placeholder="MM/YY" className="w-full px-3 py-2 rounded border bg-background"/></div>
            <div className="md:col-span-2 flex gap-2"><button type="button" onClick={()=>setStep(1)} className="px-4 py-2 rounded border">Back</button><button className="px-4 py-2 rounded bg-blue-600 text-white">Continue to Review</button></div>
          </form>
        )}

        {step===3 && (
          <form onSubmit={(e)=>{e.preventDefault(); setLoading(true); setTimeout(()=>router.push('/orders/123'), 1200);}} className="rounded-xl border border-black/10 dark:border-white/10 p-6 space-y-3">
            <h4 className="font-semibold">Review Your Order</h4>
            <div className="text-sm text-foreground/70">Shipping to John Doe, 123 Main Street, NY</div>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" required/> I agree to the terms</label>
            <div className="flex gap-2"><button type="button" onClick={()=>setStep(2)} className="px-4 py-2 rounded border">Back</button><button disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white">{loading?'Processing…':'Place Order'}</button></div>
          </form>
        )}
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 h-fit">
        <h5 className="font-semibold mb-3">Order Summary</h5>
        <div className="space-y-2 mb-3 text-sm">
          {cartItems.map(i => (
            <div key={i.id} className="flex items-center justify-between"><span>{i.name} × {i.qty}</span><span>${((i.priceCents*i.qty)/100).toFixed(2)}</span></div>
          ))}
        </div>
        <div className="flex justify-between mb-1 text-sm"><span>Subtotal</span><span>${(subtotal/100).toFixed(2)}</span></div>
        <div className="flex justify-between mb-1 text-sm"><span>Shipping</span><span>${(shipping/100).toFixed(2)}</span></div>
        <div className="flex justify-between mb-2 text-sm"><span>Tax</span><span>${(tax/100).toFixed(2)}</span></div>
        <hr className="my-2" />
        <div className="flex justify-between font-semibold"><span>Total</span><span>${(total/100).toFixed(2)}</span></div>
      </div>
    </div>
  );
}







