import Link from 'next/link';

async function getOrder(id) {
  return {
    id,
    date: '2025-01-15',
    status: 'Shipped',
    totalCents: 69997,
    tracking: 'TRK123456789',
    shippingAddress: { name: 'John Doe', street: '123 Main Street', city: 'New York', state: 'NY', zip: '10001', country: 'United States' },
    items: [
      { id: 1, name: 'Premium Headphones', priceCents: 9999, qty: 1, imageUrl: 'https://placehold.co/100x100/3b82f6/fff?text=HP' },
      { id: 2, name: 'Smart Watch', priceCents: 29999, qty: 2, imageUrl: 'https://placehold.co/100x100/8b5cf6/fff?text=Watch' }
    ]
  };
}

export default async function OrderDetailPage({ params }) {
  const order = await getOrder(params.id);
  const subtotal = order.items.reduce((s,i)=>s+i.priceCents*i.qty,0); const shipping=999; const tax=Math.floor(subtotal*0.08);
  const statusColor = (s)=> s==='Delivered'?'bg-green-500/20 text-green-700 dark:text-green-300': s==='Shipped'?'bg-blue-500/20 text-blue-700 dark:text-blue-300':'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/orders" className="inline-block mb-3 hover:underline">← Back to Orders</Link>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <div className="text-sm text-foreground/70">Placed on {order.date}</div>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${statusColor(order.status)}`}>{order.status}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-black/10 dark:border-white/10 p-4">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {order.items.map(i => (
              <div key={i.id} className="py-3 grid grid-cols-12 items-center gap-3">
                <img src={i.imageUrl} className="w-16 h-16 rounded object-cover col-span-2" />
                <div className="col-span-7">
                  <Link href={`/product/${i.id}`} className="font-semibold hover:underline">{i.name}</Link>
                  <div className="text-sm text-foreground/70">Qty: {i.qty}</div>
                </div>
                <div className="col-span-3 text-right font-semibold">${((i.priceCents*i.qty)/100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
            <h6 className="font-semibold mb-2">Shipping Address</h6>
            <p className="text-sm">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
              {order.shippingAddress.country}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
            <h6 className="font-semibold mb-2">Order Summary</h6>
            <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>${(subtotal/100).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span>Shipping</span><span>${(shipping/100).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mb-2"><span>Tax</span><span>${(tax/100).toFixed(2)}</span></div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold"><span>Total</span><span>${(order.totalCents/100).toFixed(2)}</span></div>
          </div>
          <div className="grid gap-2">
            <Link href={`/invoice/${order.id}`} className="px-3 py-2 rounded border border-black/10 dark:border-white/10 text-center">View Invoice</Link>
            <button className="px-3 py-2 rounded border border-black/10 dark:border-white/10">Download Receipt</button>
            <button className="px-3 py-2 rounded border border-red-500/40 text-red-600">Request Return</button>
          </div>
        </div>
      </div>
    </div>
  );
}







