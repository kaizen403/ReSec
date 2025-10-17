'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductPage({ params }) {
  const { id: resolvedId } = use(params);
  const productId = (() => {
    const raw = String(resolvedId ?? '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [errorFlag, setErrorFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const fallbackProducts = {
    1: {
      id: 1,
      name: 'Fjallraven Foldsack Backpack',
      description: 'Your perfect pack for everyday use and walks in the forest.',
      priceCents: 10995,
      imageUrl: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
      categoryId: 1
    },
    2: {
      id: 2,
      name: 'Mens Casual Premium Slim Fit Tee',
      description: 'Slim-fitting style with a comfortable jersey fabric.',
      priceCents: 2230,
      imageUrl: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879_.jpg',
      categoryId: 1
    },
    3: {
      id: 3,
      name: 'Mens Cotton Jacket',
      description: 'Great outerwear jackets for Spring/Autumn/Winter.',
      priceCents: 5599,
      imageUrl: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      categoryId: 2
    },
    4: {
      id: 4,
      name: 'Mens Casual Slim Fit',
      description: 'The color could be slightly different between on the screen and in practice.',
      priceCents: 1599,
      imageUrl: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg',
      categoryId: 2
    },
    5: {
      id: 5,
      name: "Women's Legends Naga Bracelet",
      description: 'Inspired by the mythical water dragon that protects the ocean.',
      priceCents: 69500,
      imageUrl: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
      categoryId: 3
    },
    6: {
      id: 6,
      name: 'Solid Gold Petite Micropave Ring',
      description: 'Satisfaction guaranteed. Lovely tiny stackable ring.',
      priceCents: 16800,
      imageUrl: 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg',
      categoryId: 3
    },
    7: {
      id: 7,
      name: 'White Gold Plated Princess Ring',
      description: 'Classic created wedding engagement solitaire diamond promise ring.',
      priceCents: 9990,
      imageUrl: 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg',
      categoryId: 3
    },
    8: {
      id: 8,
      name: 'Pierced Owl Rose Gold Earrings',
      description: 'Rose Gold Plated Double Flared Tunnel Plug Earrings.',
      priceCents: 1099,
      imageUrl: 'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_.jpg',
      categoryId: 3
    },
    9: {
      id: 9,
      name: 'WD 2TB Elements Portable Drive',
      description: 'USB 3.0 portable external hard drive with fast data transfers.',
      priceCents: 6400,
      imageUrl: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
      categoryId: 4
    },
    10: {
      id: 10,
      name: 'SanDisk SSD PLUS 1TB Internal SSD',
      description: 'Easy upgrade for faster boot-up, shutdown, application load and response.',
      priceCents: 5999,
      imageUrl: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
      categoryId: 4
    }
  };
  const xssPattern = /<|>|on\w+=|javascript:|alert\s*\(|script|svg|img/i;
  const defaultFlag = process.env.NEXT_PUBLIC_XSS_REFLECTED_FLAG || 'PCTFS{reflected_xss_alert_flag}';

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId);
  }, [productId]);

  useEffect(() => {
    if (error && errorFlag) {
      alert(`Flag: ${errorFlag}`);
    }
  }, [error, errorFlag]);

  const fetchProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/products/${encodeURIComponent(id)}`);
      if (!res.ok) {
        let payload;
        try {
          payload = await res.json();
        } catch {
          payload = {};
        }
        const flagFromServer = payload?.xssFlag || res.headers.get('x-xss-flag');
        const err = new Error(`Product "${id}" not found`);
        if (flagFromServer) {
          err.xssFlag = flagFromServer;
        }
        throw err;
      }
      const data = await res.json();
      setError('');
      setErrorFlag(null);
      setProduct(data);
      setReviews(data.reviews || []);
      setLoading(false);
    } catch (err) {
      const fallback = fallbackProducts[id];
      if (fallback) {
        setProduct(fallback);
        setReviews([]);
        setError('');
        setErrorFlag(null);
        setLoading(false);
        return;
      }
      // VULNERABILITY: Error message contains unsanitized user input
      setError(err.message);
      const defaultFlag = process.env.NEXT_PUBLIC_XSS_ALERT_FLAG || 'PCTFS{xss_alert_bonus_flag}';
      const suspicious = xssPattern.test(String(id));
      setErrorFlag(err.xssFlag || (suspicious ? defaultFlag : null));
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // VULNERABILITY: Stored XSS - review text is not sanitized
      const res = await fetch('http://localhost:4000/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          rating: newReview.rating,
          text: newReview.text // XSS payload can be injected here
        })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (res.ok) {
        const review = data.review || data;
        const reviewWithId = {
          ...review,
          id: review?.id ?? Date.now()
        };
        setReviews((prev) => [reviewWithId, ...prev]);
        setNewReview({ rating: 5, text: '' });
        if (data.flag) {
          alert(`Flag: ${data.flag}`);
        }
      } else {
        alert('Failed to submit review. Please log in.');
      }
    } catch (err) {
      alert('Error submitting review');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    // VULNERABILITY: Reflected XSS - error message rendered with dangerouslySetInnerHTML
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <div 
            className="text-foreground/80"
            dangerouslySetInnerHTML={{ __html: error }}
          />
          <Link href="/products" className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-block mb-4 text-sm hover:underline">← Back to Products</Link>
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
          <img src={product.imageUrl || `https://placehold.co/600x600/3b82f6/fff?text=${encodeURIComponent(product.name)}`} alt={product.name} className="w-full h-[480px] object-cover" />
        </div>
        <div>
          <div className="inline-block text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 mb-2">
            {product.categoryId ? `Category ${product.categoryId}` : 'General'}
          </div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="mb-3 text-amber-500">
            ⭐⭐⭐⭐⭐ <span className="text-foreground/70">({reviews.length} reviews)</span>
          </div>
          <div className="text-3xl text-blue-600 dark:text-blue-400 font-extrabold mb-4">${(product.priceCents/100).toFixed(2)}</div>
          <p className="text-foreground/80 mb-4">{product.description}</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Add to Cart</button>
            <button className="px-4 py-2 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">❤️ Add to Wishlist</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
        
        {/* Review submission form */}
        <form onSubmit={handleSubmitReview} className="rounded-xl border border-black/10 dark:border-white/10 p-4 mb-6">
          <h4 className="font-semibold mb-3">Write a Review</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select 
                value={newReview.rating}
                onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              >
                {[5,4,3,2,1].map(r => (
                  <option key={r} value={r}>{'⭐'.repeat(r)} ({r} stars)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Review</label>
              <textarea 
                value={newReview.text}
                onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                placeholder="Share your experience with this product..."
                required
                rows={4}
                className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Tip: Share constructive feedback to help other shoppers.
              </p>
            </div>
            <button 
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>

        {/* Reviews list - VULNERABILITY: Stored XSS rendered here */}
        <div className="space-y-3">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold">{review.user?.displayName || review.user?.username || 'Anonymous'}</div>
                  <div className="text-amber-500 text-sm">{'⭐'.repeat(review.rating)}</div>
                </div>
                <span className="text-xs text-foreground/60">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* VULNERABILITY: Stored XSS - review text rendered with dangerouslySetInnerHTML */}
              <div 
                className="text-sm text-foreground/80"
                dangerouslySetInnerHTML={{ __html: review.text }}
              />
            </div>
          )) : (
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 text-center text-foreground/60">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
