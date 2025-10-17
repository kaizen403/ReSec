export default async function InvoicePage({ params, searchParams }) {
  const items = [
    { id: 1, description: 'Premium Headphones', qty: 1, priceCents: 9999 },
    { id: 2, description: 'Smart Watch', qty: 2, priceCents: 29999 }
  ];
  const subtotal = items.reduce((s,i)=> s+i.priceCents*i.qty,0); const tax=Math.floor(subtotal*0.08); const total=subtotal+tax;
  const note = searchParams?.note || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end gap-2 mb-3 no-print">
        <button className="px-3 py-2 rounded border" onClick={()=>window.print()}>🖨️ Print Invoice</button>
      </div>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-6">
        <div className="grid md:grid-cols-2 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">INVOICE</h1>
            <div>
              <strong>Hackazon Inc.</strong><br/>
              456 Commerce Ave<br/>San Francisco, CA 94102<br/>United States
            </div>
          </div>
          <div className="text-right">
            <h4 className="font-semibold">INV-2025-{params.id}</h4>
            <div className="text-sm text-foreground/70">Invoice #{params.id}</div>
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-green-500/20 text-green-700 dark:text-green-300">Paid</span>
          </div>
        </div>

        <div className="mb-6">
          <h6 className="font-semibold mb-2">Bill To:</h6>
          <div>John Doe<br/>john@example.com<br/>123 Main Street<br/>New York, NY 10001</div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead className="bg-black/5 dark:bg-white/10">
            <tr>
              <th className="text-left p-2">Description</th>
              <th className="text-center p-2">Qty</th>
              <th className="text-right p-2">Unit Price</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-black/10 dark:border-white/10">
                <td className="p-2">{i.description}</td>
                <td className="text-center p-2">{i.qty}</td>
                <td className="text-right p-2">${(i.priceCents/100).toFixed(2)}</td>
                <td className="text-right p-2">${((i.priceCents*i.qty)/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid md:grid-cols-3 gap-4 justify-end mb-6">
          <div className="md:col-start-3 space-y-1">
            <div className="flex justify-between"><span>Subtotal:</span><span>${(subtotal/100).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax (8%):</span><span>${(tax/100).toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total:</span><span>${(total/100).toFixed(2)}</span></div>
          </div>
        </div>

        {note && (
          <div className="rounded bg-black/5 dark:bg-white/5 p-3 mb-4">
            <h6 className="font-semibold mb-1">Note:</h6>
            <div dangerouslySetInnerHTML={{ __html: note }} />
          </div>
        )}

        <div className="text-center text-sm text-foreground/70 border-t border-black/10 dark:border-white/10 pt-4">
          Thank you for your business!
        </div>
      </div>
      <style jsx global>{`
        @media print { .no-print { display: none !important } }
      `}</style>
    </div>
  );
}






