export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2">About Hackazon</h1>
        <p className="text-foreground/70">Your trusted partner in online shopping since 2020</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-3">Our Story</h2>
          <p className="text-foreground/80 mb-3">Hackazon was founded with a simple mission: to provide high-quality products at affordable prices with exceptional customer service. We believe that shopping online should be easy, secure, and enjoyable.</p>
          <p className="text-foreground/80">Over the years, we've grown from a small startup to a trusted e-commerce platform serving thousands of satisfied customers. Our commitment to quality, transparency, and customer satisfaction remains unwavering.</p>
        </div>
        <div className="rounded-2xl h-72 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-8xl">🏢</div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-6">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[{icon:'💎', title:'Quality', text:'We handpick every product to ensure the highest standards of quality and durability.'},{icon:'🤝', title:'Trust', text:'Building lasting relationships with our customers through transparency and honesty.'},{icon:'⚡', title:'Innovation', text:'Constantly improving our platform to provide the best shopping experience.'}].map((v,i)=> (
            <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 p-6 text-center">
              <div className="text-5xl mb-2">{v.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-foreground/70">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-8 bg-black/5 dark:bg-white/5 text-center">
        <h2 className="text-2xl font-bold mb-2">By the Numbers</h2>
        <div className="grid md:grid-cols-4 gap-6 mt-4">
          {[{n:'50K+', l:'Happy Customers'},{n:'10K+', l:'Products'},{n:'100K+', l:'Orders Shipped'},{n:'4.8', l:'Average Rating'}].map((s,i)=>(
            <div key={i}>
              <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{s.n}</div>
              <div className="text-sm text-foreground/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






