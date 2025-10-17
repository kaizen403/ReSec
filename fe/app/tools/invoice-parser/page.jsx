'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function InvoiceParserPage() {
  const [xmlData, setXmlData] = useState(`<invoices>
  <invoice id="INV-001">
    <customer>John Doe</customer>
    <amount>299.99</amount>
    <date>2025-01-15</date>
    <items>
      <item>Wireless Headphones</item>
      <item>Phone Case</item>
    </items>
  </invoice>
</invoices>`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleParse = async (e) => {
    e.preventDefault();
    if (!xmlData.trim()) {
      setError('Please enter XML invoice data to parse');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/invoice/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ xml: xmlData })
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data: data
      });

      if (!response.ok) {
        setError(data.error || 'Parsing failed');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleInvoice = (type) => {
    const samples = {
      single: `<invoices>
  <invoice id="INV-001">
    <customer>Alice Smith</customer>
    <amount>149.99</amount>
    <date>2025-01-15</date>
    <items>
      <item>Coffee Maker</item>
    </items>
  </invoice>
</invoices>`,
      multiple: `<invoices>
  <invoice id="INV-002">
    <customer>Bob Johnson</customer>
    <amount>89.50</amount>
    <date>2025-01-14</date>
    <items>
      <item>Book</item>
      <item>Notebook</item>
    </items>
  </invoice>
  <invoice id="INV-003">
    <customer>Carol White</customer>
    <amount>299.99</amount>
    <date>2025-01-13</date>
    <items>
      <item>Tablet</item>
    </items>
  </invoice>
</invoices>`,
      detailed: `<invoices>
  <invoice id="INV-004">
    <customer>David Brown</customer>
    <email>david@example.com</email>
    <amount>459.99</amount>
    <tax>36.80</tax>
    <total>496.79</total>
    <date>2025-01-12</date>
    <billing_address>
      <street>123 Main St</street>
      <city>New York</city>
      <zip>10001</zip>
    </billing_address>
    <items>
      <item quantity="1" price="459.99">Gaming Monitor</item>
    </items>
  </invoice>
</invoices>`
    };
    setXmlData(samples[type]);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice Parser Tool</h1>
          <p className="text-foreground/70 mt-2">
            Parse and validate XML invoice data. This tool helps process invoice files from various sources and formats.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex items-start">
            <div className="text-green-600 dark:text-green-400 mr-3">✅</div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Public Tool</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                This parsing tool is available to all users. No special permissions required.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleParse} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">XML Invoice Data</label>
              <textarea
                value={xmlData}
                onChange={(e) => setXmlData(e.target.value)}
                rows={14}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 font-mono text-sm"
                placeholder="Paste XML invoice data here..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSampleInvoice('single')}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Single Invoice
              </button>
              <button
                type="button"
                onClick={() => loadSampleInvoice('multiple')}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Multiple Invoices
              </button>
              <button
                type="button"
                onClick={() => loadSampleInvoice('detailed')}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Detailed Invoice
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Parsing Invoice...' : 'Parse Invoice'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="text-red-800 dark:text-red-200 text-sm">
              <strong>Parsing Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Parsing Result</h3>
              <pre className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono p-3 rounded border border-gray-200 dark:border-gray-700 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
{JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-4">
          <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🔧 Parser Features</h3>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Supports standard XML invoice formats</li>
            <li>• Validates invoice structure and required fields</li>
            <li>• Extracts customer information, amounts, and line items</li>
            <li>• Handles complex nested XML structures</li>
            <li>• Processes custom XML entities and references</li>
            <li>• Compatible with most accounting software exports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
