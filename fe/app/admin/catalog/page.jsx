'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function CatalogImportPage() {
  const [xmlData, setXmlData] = useState(`<products>
  <product>
    <name>Sample Product</name>
    <price>29.99</price>
    <category>Electronics</category>
  </product>
</products>`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!xmlData.trim()) {
      setError('Please enter XML data to import');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin': 'true'
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
        setError(data.error || 'Import failed');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleXml = (type) => {
    const samples = {
      basic: `<products>
  <product>
    <name>Wireless Headphones</name>
    <price>89.99</price>
    <category>Electronics</category>
  </product>
  <product>
    <name>Coffee Mug</name>
    <price>12.99</price>
    <category>Home</category>
  </product>
</products>`,
      advanced: `<products>
  <product id="1">
    <name>Gaming Laptop</name>
    <price>1299.99</price>
    <category>Computers</category>
    <description>High-performance gaming laptop</description>
    <stock>15</stock>
  </product>
</products>`,
      bulk: `<products>
  <product><name>Item 1</name><price>10.00</price><category>Test</category></product>
  <product><name>Item 2</name><price>20.00</price><category>Test</category></product>
  <product><name>Item 3</name><price>30.00</price><category>Test</category></product>
</products>`
    };
    setXmlData(samples[type]);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Catalog Import</h1>
          <p className="text-foreground/70 mt-2">
            Import product catalogs in XML format. This tool processes XML data and adds products to the database.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
          <div className="flex items-start">
            <div className="text-amber-600 dark:text-amber-400 mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Admin Access Required</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This feature requires admin privileges. The system will validate your access automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">XML Catalog Data</label>
              <textarea
                value={xmlData}
                onChange={(e) => setXmlData(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 font-mono text-sm"
                placeholder="Enter XML catalog data..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSampleXml('basic')}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Load Basic Sample
              </button>
              <button
                type="button"
                onClick={() => loadSampleXml('advanced')}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Load Advanced Sample
              </button>
              <button
                type="button"
                onClick={() => loadSampleXml('bulk')}
                className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Load Bulk Sample
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Import...' : 'Import Catalog'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="text-red-800 dark:text-red-200 text-sm">
              <strong>Import Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Import Result</h3>
              <pre className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono p-3 rounded border border-gray-200 dark:border-gray-700 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
{JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 XML Format Guidelines</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use standard XML format with proper opening/closing tags</li>
            <li>• Each product should have: name, price, category</li>
            <li>• Optional fields: description, stock, id</li>
            <li>• The system supports custom XML structures and entities</li>
            <li>• Large catalogs are processed in batches automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
