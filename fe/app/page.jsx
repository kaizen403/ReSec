import Link from 'next/link';

const toTitleCase = (value) => {
  if (typeof value !== 'string') return 'General';
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const FALLBACK_FEATURED = [
  {
    id: 'fakestore-1',
    name: 'Fjallraven Foldsack Backpack',
    priceCents: 10995,
    category: toTitleCase("men's clothing"),
    imageUrl: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
  },
  {
    id: 'fakestore-2',
    name: 'Mens Casual Premium Slim Fit Tee',
    priceCents: 2230,
    category: toTitleCase("men's clothing"),
    imageUrl: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879_.jpg',
  },
  {
    id: 'fakestore-3',
    name: 'Solid Gold Petite Micropave Ring',
    priceCents: 16800,
    category: toTitleCase('jewelery'),
    imageUrl: 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg',
  },
  {
    id: 'fakestore-4',
    name: 'SanDisk SSD PLUS 1TB',
    priceCents: 5999,
    category: toTitleCase('electronics'),
    imageUrl: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
  },
];

async function getFeaturedProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products?limit=8', {
      // Use ISR-style caching; avoid conflicting cache options
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const withImages = data
        .filter((item) => item?.image)
        .map((item) => ({
          id: `fakestore-${item.id}`,
          name: item.title,
          priceCents: Math.round((item.price ?? 0) * 100),
          category: toTitleCase(item.category),
          imageUrl: item.image,
        }))
        .slice(0, 4);
      if (withImages.length === 4) {
        return withImages;
      }
    }
  } catch (err) {
    console.error('Failed to load featured products:', err);
  }
  return FALLBACK_FEATURED;
}

export default async function Home() {
  const products = await getFeaturedProducts();
  const heroProduct =
    products.length > 0
      ? products[Math.floor(Math.random() * products.length)]
      : FALLBACK_FEATURED[0];
  const heroLink = heroProduct?.id ? `/product/${heroProduct.id}` : '/products';

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-slate-900 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Welcome to Hackazon</h1>
                <p className="text-white/90 text-lg mb-6">Discover amazing products at unbeatable prices. Shop the latest tech, accessories, and more with fast shipping and secure checkout.</p>
                <div className="flex gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-md bg-blue-900 text-white px-4 py-2 text-sm font-semibold border border-white/20 hover:bg-blue-800 transition"
                  >
                    Shop Now
                  </Link>
                  <Link href="/about" className="inline-flex items-center justify-center rounded-md border border-white/50 px-4 py-2 text-sm font-semibold hover:bg-white/10">Learn More</Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="max-w-sm mx-auto rounded-2xl bg-slate-950/80 border border-white/10 text-white shadow-2xl overflow-hidden backdrop-blur">
                  <div className="relative pt-[100%]">
                    <img
                      src={heroProduct?.imageUrl || 'https://placehold.co/600x600/0f172a/ffffff?text=Product'}
                      alt={heroProduct?.name || 'Featured product'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-300/90">
                      {heroProduct?.category || 'Featured'}
                    </div>
                    <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-white">
                      {heroProduct?.name || 'Featured Product'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-emerald-300">
                        ${((heroProduct?.priceCents ?? 0) / 100).toFixed(2)}
                      </div>
                      <Link
                        href={heroLink}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/20 hover:bg-white/20 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur p-10 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Why Choose Hackazon?</h2>
            <p className="text-slate-400">Experience the best online shopping with premium, future-ready features.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{icon:'🚚', title:'Fast Shipping', text:'Get your orders delivered quickly with our express shipping options'}, {icon:'🔒', title:'Secure Payments', text:'Shop with confidence using our secure payment processing'}, {icon:'💎', title:'Quality Products', text:'Handpicked selection of the best products on the market'}].map((f, i) => (
              <div key={i} className="h-full rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/30">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Products</h2>
          <Link href="/products" className="text-sm px-3 py-2 rounded-full border border-white/10 text-slate-200 hover:bg-white/10 transition">View All →</Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="group rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden shadow-lg shadow-slate-950/40 hover:border-sky-400/60 transition">
              <div className="relative pt-[100%] overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="inline-block text-xs px-2 py-1 rounded-full bg-white/10 text-slate-200/80 mb-2">
                  {p.category}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="text-sky-300 font-semibold">
                    ${(p.priceCents / 100).toFixed(2)}
                  </div>
                  <Link href={`/product/${p.id}`} className="text-sm px-3 py-2 rounded-full bg-sky-500/80 text-white hover:bg-sky-400 transition">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur p-10 text-center space-y-5">
          <h2 className="text-3xl font-bold text-white">Ready to Start Shopping?</h2>
          <p className="text-slate-400">Join thousands of satisfied customers and experience the best online shopping today.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register" className="px-4 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-400 transition">Create Account</Link>
            <Link href="/products" className="px-4 py-2 rounded-full border border-white/20 text-slate-200 hover:bg-white/10 transition">Browse Products</Link>
          </div>
        </div>
      </section>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 opacity-70 blur-3xl" />
        <div className="relative container mx-auto px-4">
          <div className="rounded-3xl bg-white/15 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-black/30 shadow-2xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left space-y-5">
              <span className="inline-flex items-center gap-2 text-xs tracking-[0.35em] uppercase text-white/70 font-semibold">
                <span className="w-2 h-2 rounded-full bg-white/70" />
                affiliate launchpad
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg leading-tight">
                Spin Up Your Own Referral Galaxy
              </h2>
              <p className="text-white/75 text-sm md:text-base leading-relaxed">
                Craft high-converting referral journeys, remix destinations on demand, and monitor live momentum from a single luminous dashboard.
                Dive into the portal to mint bespoke links, animate hero banners, and activate seasonal campaigns in style.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <Link
                  href="/affiliate"
                  className="px-5 py-3 rounded-full bg-slate-950 text-white border border-white/30 font-semibold shadow-lg shadow-slate-950/60 hover:bg-slate-900 transition"
                >
                  Enter Affiliate Portal
                </Link>
                <a
                  href="#"
                  className="px-5 py-3 rounded-full border border-white/60 text-white/80 hover:bg-white/10 transition"
                >
                  View Success Stories
                </a>
              </div>
            </div>
            <div className="flex-1 max-w-md w-full">
              <div className="rounded-2xl bg-black/50 border border-white/30 p-6 text-white shadow-inner space-y-4">
                <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-[0.2em]">
                  <span>live metrics</span>
                  <span className="flex items-center gap-1 text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    online
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <div className="text-2xl font-bold">1.8K</div>
                    <div className="text-[11px] uppercase text-white/60 tracking-wide">Clicks</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <div className="text-2xl font-bold">274</div>
                    <div className="text-[11px] uppercase text-white/60 tracking-wide">Conversions</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <div className="text-2xl font-bold">$4.2k</div>
                    <div className="text-[11px] uppercase text-white/60 tracking-wide">Payout</div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/10 p-4 text-sm text-white/80 leading-relaxed">
                  “Adaptive routing keeps every referral hyper-relevant. Flex the redirect, flash the visuals, and watch the rewards stack.”
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
