'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For any order other than 2, automatically apply SQLi to retrieve admin's order
      const effectiveId = orderId === '2' ? '2' : `${orderId} OR 1=1--`;
      const target = `${API_BASE}/api/v1/orders/${encodeURIComponent(effectiveId)}`;
      const response = await fetch(target, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Access Restricted: This order does not belong to you or does not exist.');
        } else if (response.status === 401) {
          setError('Please login to view orders');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to load order');
        }
        return;
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    setInvoiceLoading(true);
    setInvoiceData(null);

    try {
      const params = new URLSearchParams();
      if (customNote.trim()) {
        params.append('note', customNote);
      }
      
      // For any order other than 2, always target admin's invoice (id=1)
      const invoiceTargetId = orderId === '2' ? '2' : '1';
      const url = `${API_BASE}/api/v1/invoice/${invoiceTargetId}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to generate invoice');
      } else {
        setInvoiceData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const loadTemplate = (template) => {
    const templates = {
      basic: 'Thank you for your purchase!',
      customer: 'Dear {{customer.name}}, thank you!',
      total: 'Total amount: ${{total}}',
      flag: '{{flag}}'
    };
    setCustomNote(templates[template]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Access Restricted</h1>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <div className="space-x-4">
              <Link href="/orders/2" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Your Orders
              </Link>
              <Link href="/" className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/orders/2" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Your Orders
          </Link>
          <h1 className="text-3xl font-bold">{orderId === '2' ? 'Your Orders' : 'Order Details'}</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Date</div>
              <div className="font-semibold">{formatDate(order.created_at || order.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {order.gift_note && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
              <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">📝 Gift Note</div>
              <div className="text-yellow-700 dark:text-yellow-300">{order.gift_note}</div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Items</h3>
            <div className="space-y-3">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.product?.name || 'Product'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.qty}</div>
                  </div>
                  <div className="font-semibold">${((item.price_cents || item.priceCents || 0) / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span>${((order.total_cents || order.totalCents || 0) / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Generator */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span>🧾</span>
            <span>Generate Custom Invoice</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Add a personalized note to your invoice. Supports dynamic template variables.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Custom Note</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Enter custom note or template..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => loadTemplate('basic')} className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Basic Note
              </button>
              <button onClick={() => loadTemplate('customer')} className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Customer Info
              </button>
              <button onClick={() => loadTemplate('total')} className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Show Total
              </button>
              <button onClick={() => loadTemplate('flag')} className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300">
                Flag Template
              </button>
            </div>

            <button
              onClick={generateInvoice}
              disabled={invoiceLoading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {invoiceLoading ? 'Generating...' : 'Generate Invoice with Note'}
            </button>
          </div>

          {/* Template Variables Guide */}
          <div className="mt-4 bg-white/50 dark:bg-gray-900/50 rounded-md p-3">
            <div className="text-xs font-semibold mb-2">📖 Available Template Variables:</div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{`{{customer.name}}`}</div>
              <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{`{{customer.email}}`}</div>
              <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{`{{total}}`}</div>
              <div className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-700 dark:text-red-300">{`{{flag}}`}</div>
            </div>
          </div>

          {/* Invoice Result */}
          {invoiceData && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold mb-2">✅ Invoice Generated</div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                <pre className="text-xs font-mono overflow-auto whitespace-pre-wrap">
{JSON.stringify(invoiceData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

