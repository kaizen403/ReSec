'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    if (q || category) {
      searchProducts();
    }
  }, [q, category]);

  const searchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      // VULNERABILITY: SQL Injection through query parameters
      // The backend does not sanitize these parameters
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category) params.append('category', category);
      
      const res = await fetch(`http://localhost:4000/api/v1/products/search?${params}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setProducts([]);
      } else {
        setProducts(data.items || []);
      }
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Products</h1>
      <form className="grid md:grid-cols-3 gap-3 mb-6">
        <input name="q" defaultValue={q} placeholder="Search for products..." className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background" />
        <select name="category" defaultValue={category} className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background">
          <option value="">All Categories</option>
          <option value="1">Electronics</option>
          <option value="2">Accessories</option>
          <option value="3">Clothing</option>
          <option value="4">Home</option>
        </select>
        <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">🔍 Search</button>
      </form>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-1">Error</h4>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : q || category ? (
        products.length > 0 ? (
          <div>
            <p className="text-sm text-foreground/70 mb-4">Found {products.length} products</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 overflow-hidden shadow-sm">
                  <div className="relative pt-[100%]">
                    <img 
                      src={p.image_url || p.imageUrl || `https://placehold.co/300x300/3b82f6/fff?text=Product`} 
                      alt={p.name} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-foreground/70 mb-2 line-clamp-3">{p.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">
                        ${((p.price_cents || p.priceCents || 0)/100).toFixed(2)}
                      </div>
                      <Link href={`/product/${p.id}`} className="text-sm px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-10 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h4 className="text-lg font-semibold mb-1">No Results Found</h4>
            <p className="text-foreground/70 mb-3">Try different keywords or browse our categories</p>
            <Link href="/products" className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Browse All Products</Link>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-10 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h4 className="text-lg font-semibold mb-1">Start Your Search</h4>
          <p className="text-foreground/70">Enter keywords above to find products</p>
        </div>
      )}
    </div>
  );
}





