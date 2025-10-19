import Link from 'next/link';

const toTitleCase = (value) => {
  if (typeof value !== 'string') return 'General';
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatRating = (rating) => {
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    return rating.toFixed(1);
  }
  if (rating && typeof rating === 'object' && typeof rating.rate === 'number') {
    return rating.rate.toFixed(1);
  }
  if (typeof rating === 'string' && rating.trim().length > 0) {
    return rating;
  }
  return 'N/A';
};

const FALLBACK_PRODUCTS = [
  {
    id: 'fakestore-1',
    name: 'Fjallraven Foldsack Backpack',
    priceCents: 10995,
    imageUrl: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    category: toTitleCase("men's clothing"),
    rating: '3.9',
  },
  {
    id: 'fakestore-2',
    name: 'Mens Casual Premium Slim Fit Tee',
    priceCents: 2230,
    imageUrl: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879_.jpg',
    category: toTitleCase("men's clothing"),
    rating: '4.1',
  },
  {
    id: 'fakestore-3',
    name: 'Mens Cotton Jacket',
    priceCents: 5599,
    imageUrl: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
    category: toTitleCase("men's clothing"),
    rating: '4.7',
  },
  {
    id: 'fakestore-4',
    name: 'Mens Casual Slim Fit',
    priceCents: 1599,
    imageUrl: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg',
    category: toTitleCase("men's clothing"),
    rating: '2.1',
  },
  {
    id: 'fakestore-5',
    name: "Women's Legends Naga Bracelet",
    priceCents: 69500,
    imageUrl: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
    category: toTitleCase('jewelery'),
    rating: '4.6',
  },
  {
    id: 'fakestore-6',
    name: 'Solid Gold Petite Micropave Ring',
    priceCents: 16800,
    imageUrl: 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg',
    category: toTitleCase('jewelery'),
    rating: '3.9',
  },
  {
    id: 'fakestore-7',
    name: 'White Gold Plated Princess Ring',
    priceCents: 9990,
    imageUrl: 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg',
    category: toTitleCase('jewelery'),
    rating: '3.0',
  },
  {
    id: 'fakestore-8',
    name: 'Pierced Owl Rose Gold Earrings',
    priceCents: 1099,
    imageUrl: 'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_.jpg',
    category: toTitleCase('jewelery'),
    rating: '4.0',
  },
  {
    id: 'fakestore-9',
    name: 'WD 2TB Elements Portable Drive',
    priceCents: 6400,
    imageUrl: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
    category: toTitleCase('electronics'),
    rating: '3.3',
  },
  {
    id: 'fakestore-10',
    name: 'SanDisk SSD PLUS 1TB',
    priceCents: 5999,
    imageUrl: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
    category: toTitleCase('electronics'),
    rating: '2.9',
  }
];

async function getProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products', {
      // Use ISR-style caching; avoid conflicting cache options
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error(`Failed to load products (${res.status})`);
    }
    const data = await res.json();
    const items = data
      .filter((item) => item?.image)
      .map((item) => ({
        id: `fakestore-${item.id}`,
        name: item.title,
        priceCents: Math.round((item.price ?? 0) * 100),
        imageUrl: item.image,
        category: toTitleCase(item.category),
        rating: formatRating(item.rating),
      }));
    if (items.length > 0) {
      return { items, total: items.length };
    }
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }
  return { items: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length };
}

export default async function ProductsPage() {
  const data = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 sticky top-20">
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">Category</div>
                {['Electronics','Accessories','Clothing','Home'].map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input type="checkbox" className="accent-blue-600" /> <span>{c}</span>
                  </label>
                ))}
              </div>
              <div>
                <div className="font-medium mb-1">Price</div>
                {['Under $50','$50 - $100','$100 - $200','Over $200'].map((p) => (
                  <label key={p} className="flex items-center gap-2">
                    <input type="radio" name="price" className="accent-blue-600" /> <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Apply Filters</button>
          </div>
        </aside>
        <section className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">All Products</h1>
              <p className="text-sm text-foreground/70">{data.total} products found</p>
            </div>
            <select className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-background text-sm">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Best Rating</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.length === 0 && (
              <div className="col-span-full text-center text-sm text-foreground/60 border border-black/10 dark:border-white/10 rounded-xl p-6">
                No products available right now. Please try again later.
              </div>
            )}
            {data.items.map((p) => (
              <div key={p.id} className="group rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative pt-[100%] overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <div className="inline-block text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 mb-2">{p.category}</div>
                  <h3 className="text-sm font-semibold mb-1 line-clamp-2">{p.name}</h3>
                  <div className="text-xs text-amber-500 mb-2">⭐ {p.rating}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">${(p.priceCents/100).toFixed(2)}</div>
                    <Link href={`/product/${p.id}`} className="text-sm px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
