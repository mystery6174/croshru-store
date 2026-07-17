import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Heart, Instagram, Sparkles, Flower2, Star, ArrowRight, Plus, Minus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";

import { client } from "@/lib/sanity";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string; 
  emoji: string;
  image: string;
};

export const Route = createFileRoute("/")({
  component: Index,
  loader: async () => {
    // 2. Tell TypeScript what shape the data is in
    const data = await client.fetch<Product[]>(`*[_type == "product"]{
      "id": _id,
      name,
      price,
      "category": category->title,
      emoji,
      "image": image.asset->url
    }`);
    return data;
  }
});

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`opacity-0 translate-y-6 transition-all duration-700 ease-out [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0 ${className}`}
    >
      {children}
    </div>
  );
}

function Index() {
  const products = Route.useLoaderData();
  const [cartOpen, setCartOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false); // Add this line
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  // Dynamically pull unique categories from the products
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const dynamicCategories = ["All", ...uniqueCategories];

  const [cat, setCat] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = cat === "All" ? products : products.filter((p) => p.category === cat);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const dec = (id: string) =>
    setCart((c) => {
      const next = { ...c, [id]: (c[id] ?? 0) - 1 };
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const handleWhatsAppCheckout = () => {
    // Replace with your actual WhatsApp business number
    const phoneNumber = "919594422095"; 

    let message = "Hi croshru! 🌸 I'd like to place an order:\n\n";
    
    Object.entries(cart).forEach(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      if (p) {
        message += `${qty}x ${p.name} ($${p.price.toFixed(2)})\n`;
        message += `Image: ${p.image}\n\n`; 
      }
    });

    message += `*Total: $${total.toFixed(2)}*\n\nPlease let me know the payment and shipping details!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");

    // Add these two lines to clear the cart and close the drawer!
    setCart({});
    setCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Flower2 size={18} />
            </span>
            <span className="font-display text-2xl tracking-tight">croshru</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#story" className="hover:text-foreground transition">Story</a>
            <a href="#shop" className="hover:text-foreground transition">Shop</a>
            <a href="#custom" className="hover:text-foreground transition">Custom</a>
            <a href="#love" className="hover:text-foreground transition">Reviews</a>
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition"
            aria-label="Open cart"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-accent/50 blur-3xl" />
          <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-sage/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs uppercase tracking-widest text-secondary-foreground">
              <Sparkles size={12} /> Handmade with love
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-balance">
              Handcrafted<br />coziness,<br />
              <span className="italic text-primary">stitched with love.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md text-balance">
              Welcome to croshru — your home for adorable crochet flowers, dolls, accessories, and more. Every loop made slowly, softly, by hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-primary-foreground font-medium shadow-warm hover:-translate-y-0.5 transition"
              >
                Shop the collection <ArrowRight size={16} />
              </a>
              <a
                href="#story"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 font-medium hover:bg-secondary transition"
              >
                Our story
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span>Loved by 2,400+ cozy souls</span>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-accent/40 -rotate-2" />
            <img
              src={hero}
              alt="Flat lay of handmade crochet flowers, bunny doll, hairbands and keychains"
              width={1600}
              height={1200}
              className="relative rounded-[2rem] shadow-warm object-cover w-full aspect-[4/3]"
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-soft px-4 py-3 flex items-center gap-3 animate-float">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sage/60">
                <Heart size={16} className="text-primary" />
              </span>
              <div className="text-sm">
                <div className="font-semibold">Made in small batches</div>
                <div className="text-muted-foreground text-xs">Ships worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-border/60 bg-secondary/40 overflow-hidden py-4">
        <div className="flex whitespace-nowrap animate-marquee gap-12 font-display text-2xl text-muted-foreground">
          {[..."🌸 slow stitched · 🧸 tiny friends · 🌷 pastel palettes · 🍓 sweet keychains · 🎀 flower clips · 💌 wrapped with care · "].join("").split("·").map((s, i) => (
            <span key={i} className="italic">{s}·</span>
          ))}
          {[..."🌸 slow stitched · 🧸 tiny friends · 🌷 pastel palettes · 🍓 sweet keychains · 🎀 flower clips · 💌 wrapped with care · "].join("").split("·").map((s, i) => (
            <span key={`b${i}`} className="italic">{s}·</span>
          ))}
        </div>
      </div>

      {/* Story */}
      <section id="story" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-[2rem] bg-sage/40 rotate-2" />
            <img
              src={about}
              alt="Hands crocheting a small pink flower"
              width={1200}
              height={1408}
              loading="lazy"
              className="relative rounded-[1.75rem] shadow-soft object-cover w-full aspect-[4/5]"
            />
            <div className="absolute -bottom-4 -right-4 sm:-right-6 rounded-2xl bg-card border border-border shadow-soft p-4 max-w-[180px]">
              <div className="font-display text-3xl text-primary">120+</div>
              <div className="text-xs text-muted-foreground">hours of handwork every month</div>
            </div>
          </Reveal>

          <Reveal delay={150} className="order-1 lg:order-2">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">Our story</span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[1.1] text-balance">
              A tiny studio, a cup of tea, and endless spools of yarn.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              croshru began as a quiet hobby on rainy afternoons — one hook, one skein, one blossom at a time.
              Today, every flower, bunny and keychain is still hand-stitched slowly with the same care.
              No factories, no shortcuts — just soft cotton, warm light, and hours spent making something worth keeping.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl bg-secondary/70 p-4">
                <div className="font-display text-2xl">100%</div>
                <div className="text-muted-foreground text-xs mt-1">handmade</div>
              </div>
              <div className="rounded-2xl bg-accent/60 p-4">
                <div className="font-display text-2xl">Eco</div>
                <div className="text-muted-foreground text-xs mt-1">cotton yarn</div>
              </div>
              <div className="rounded-2xl bg-sage/60 p-4">
                <div className="font-display text-2xl">1 of 1</div>
                <div className="text-muted-foreground text-xs mt-1">each piece</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="py-16 sm:py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-primary">The collection</span>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl leading-tight">Tiny treasures, made by hand.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {dynamicCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                    cat === c
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <article className="group rounded-3xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-warm transition">
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={p.image}
                      alt={p.name}
                      width={900}
                      height={900}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-background/85 backdrop-blur px-3 py-1 text-xs">
                      {p.emoji} {p.category}
                    </span>
                    <button
                      onClick={() => { add(p.id); setCartOpen(true); }}
                      className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-warm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
                      aria-label={`Add ${p.name} to cart`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="p-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">${p.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => add(p.id)}
                      className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                    >
                      Add
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Custom */}
      <section id="custom" className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal>
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-accent/70 via-cream to-sage/50 p-10 sm:p-16 overflow-hidden">
              <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary">Made just for you</span>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-[1.1] text-balance max-w-2xl">
                Dreaming of something custom? We'd love to make it.
              </h2>
              <p className="mt-5 text-muted-foreground max-w-xl leading-relaxed">
                Match your wedding palette, recreate a beloved pet as a tiny amigurumi, or design a one-of-a-kind
                bouquet that never wilts. Tell us the vision — we'll stitch it to life.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setCustomOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 font-medium hover:-translate-y-0.5 transition"
                >
                  Request a custom piece <ArrowRight size={16} />
                </button>
                <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-5 py-3 text-sm text-muted-foreground">
                  Typical turnaround · 2–3 weeks
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section id="love" className="py-24 sm:py-32 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">Customer love</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl leading-tight">Little notes that make us blush.</h2>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { name: "Amar.", text: "My strawberry keychain is the cutest thing I own. The stitching is perfect and it came wrapped like a tiny gift.", role: "Keychain lover" },
              { name: "Sandhya", text: "We ordered a custom bouquet for our wedding — it's on our mantel forever. croshru truly listened to every detail.", role: "Custom bouquet" },
              { name: "Priya S.", text: "Bought the bunny for my daughter's birthday. She sleeps with it every night. The quality is unreal.", role: "Amigurumi bunny" },
              { name: "Twisha.", text: "Obsessed with the sage hairband. Compliments every time I wear it. Already eyeing my next order.", role: "Hair accessories" },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 80} className={i === 3 ? "md:col-span-3 max-w-2xl mx-auto" : ""}>
                <figure className="h-full rounded-3xl bg-card border border-border p-7 shadow-soft">
                  <div className="flex items-center gap-1 text-primary mb-4">
                    {[...Array(5)].map((_, k) => <Star key={k} size={14} fill="currentColor" />)}
                  </div>
                  <blockquote className="font-display text-lg leading-snug text-balance">"{t.text}"</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/70 font-display">
                      {t.name[0]}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-muted-foreground text-xs">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter + Footer */}
      <footer id="footer" className="pt-24 pb-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="rounded-[2.5rem] bg-foreground text-background p-10 sm:p-14 flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
              <div className="max-w-xl">
                <h3 className="font-display text-3xl sm:text-4xl leading-tight text-background">
                  Share your thoughts 💌
                </h3>
                <p className="mt-3 text-background/70">
                  Did your new crochet friend make you smile? We put a lot of love into every stitch, and we'd be thrilled to hear about your experience!
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setReviewOpen(true)}
                  className="rounded-full bg-primary text-primary-foreground px-8 py-3.5 font-medium hover:opacity-90 transition whitespace-nowrap"
                >
                  Write a Review
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Flower2 size={18} />
                </span>
                <span className="font-display text-2xl">croshru</span>
              </div>
              <p className="mt-4 text-muted-foreground max-w-sm text-sm leading-relaxed">
                Small-batch handmade crochet, stitched slowly in a tiny sunlit studio.
              </p>
              <div className="mt-5 flex gap-3">
                {[
                  { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/croshru.108/reels/" },
                ].map(({ icon: Icon, label, url }) => (
                  <a 
                    key={label} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={label} 
                    className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-secondary transition"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Shop</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#shop" className="hover:text-primary transition">Flowers</a></li>
                <li><a href="#shop" className="hover:text-primary transition">Amigurumi</a></li>
                <li><a href="#shop" className="hover:text-primary transition">Hair accessories</a></li>
                <li><a href="#shop" className="hover:text-primary transition">Keychains</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Help</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setShippingOpen(true)} className="hover:text-primary transition cursor-pointer text-left">Shipping policy</button>
                </li>
                <li>
                  <button onClick={() => setReturnsOpen(true)} className="hover:text-primary transition cursor-pointer text-left">Returns</button>
                </li>
                <li>
                  <button onClick={() => setFaqOpen(true)} className="hover:text-primary transition cursor-pointer text-left">FAQs</button>
                </li>
                <li>
                  <button onClick={() => setCustomOpen(true)} className="hover:text-primary transition cursor-pointer text-left">Custom orders</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} croshru · Stitched with love  ..........for any help call +91 95944 22095</div>
            <div>Made loop by loop 🌸</div>
          </div>
        </div>
      </footer>

      {/* Custom Request Modal */}
      <Dialog 
        open={customOpen} 
        onOpenChange={(open) => {
          setCustomOpen(open);
          // Reset the success state a moment after the modal closes
          if (!open) setTimeout(() => setIsSuccess(false), 300);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          {isSuccess ? (
            <div className="py-10 text-center animate-fade-in">
              <div className="text-5xl mb-4">💌</div>
              <DialogTitle className="font-display text-2xl mb-2">Request Sent!</DialogTitle>
              <DialogDescription className="text-base">
                We've received your dream design. We will review the details and email you back shortly!
              </DialogDescription>
              <button 
                onClick={() => setCustomOpen(false)} 
                className="mt-8 rounded-full bg-secondary text-secondary-foreground px-8 py-2.5 font-medium hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Request a Custom Piece</DialogTitle>
                <DialogDescription>
                  Tell us about your dream crochet item. We'll get back to you with a quote and timeline!
                </DialogDescription>
              </DialogHeader>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  const formData = new FormData(e.currentTarget);
                  
                  // REQUIRED: Paste your Web3Forms Access Key here!
                  formData.append("access_key", "b3d22825-820e-4137-a997-524e4c8ce702");
                  formData.append("subject", "New Custom Order Request for croshru");
                  formData.append("from_name", "croshru Website");

                  try {
                    const res = await fetch("https://api.web3forms.com/submit", {
                      method: "POST",
                      body: formData
                    });
                    if (res.ok) {
                      setIsSuccess(true);
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Something went wrong. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }} 
                className="grid gap-4 mt-4"
              >
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                  <input id="name" name="name" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Jane Doe" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Your Email</label>
                  <input id="email" name="email" type="email" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="jane@example.com" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="details" className="text-sm font-medium">What would you like us to make?</label>
                  <textarea id="details" name="details" required className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="I'd love a small blue bunny with a yellow scarf..." />
                </div>
                {/* Honeypot Spam Protection */}
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-full bg-primary text-primary-foreground py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Leave a Review Modal */}
      <Dialog 
        open={reviewOpen} 
        onOpenChange={(open) => {
          setReviewOpen(open);
          if (!open) setTimeout(() => setIsSuccess(false), 300);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          {isSuccess ? (
            <div className="py-10 text-center animate-fade-in">
              <div className="text-5xl mb-4">💖</div>
              <DialogTitle className="font-display text-2xl mb-2">Thank You!</DialogTitle>
              <DialogDescription className="text-base">
                Your review means the world to us. Thank you for supporting handmade!
              </DialogDescription>
              <button 
                onClick={() => {
                  setReviewOpen(false);
                  setTimeout(() => setIsSuccess(false), 300);
                }} 
                className="mt-8 rounded-full bg-secondary text-secondary-foreground px-8 py-2.5 font-medium hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Leave a Review</DialogTitle>
                <DialogDescription>
                  Tell us what you loved about your croshru order!
                </DialogDescription>
              </DialogHeader>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  const formData = new FormData(e.currentTarget);
                  
                  // REQUIRED: Paste your Web3Forms Access Key here!
                  formData.append("access_key", "b3d22825-820e-4137-a997-524e4c8ce702");
                  formData.append("subject", "New Customer Review for croshru");
                  formData.append("from_name", "croshru Reviews");

                  try {
                    const res = await fetch("https://api.web3forms.com/submit", {
                      method: "POST",
                      body: formData
                    });
                    if (res.ok) {
                      setIsSuccess(true);
                      e.currentTarget.reset(); // This clears the text boxes for next time!
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Something went wrong. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }} 
                className="grid gap-4 mt-4"
              >
                <div className="grid gap-2">
                  <label htmlFor="reviewerName" className="text-sm font-medium">Your Name</label>
                  <input id="reviewerName" name="reviewerName" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Jane Doe" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="productName" className="text-sm font-medium">Which product did you buy?</label>
                  <input id="productName" name="productName" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Strawberry Keychain" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="reviewText" className="text-sm font-medium">Your Review</label>
                  <textarea id="reviewText" name="reviewText" required className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="It is the cutest thing I own! The quality is amazing..." />
                </div>
                
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-full bg-primary text-primary-foreground py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipping Policy Modal */}
      <Dialog open={shippingOpen} onOpenChange={setShippingOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Shipping Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-4 text-muted-foreground">
            <p><strong className="text-foreground">Processing Time:</strong> Because every item is handmade loop by loop, please allow 5-7 business days for us to craft your order before it gets dispatched.</p>
            <p><strong className="text-foreground">Delivery:</strong> Standard delivery across Mumbai typically takes 3-5 business days after dispatch, depending on your exact location.</p>
            <p><strong className="text-foreground">Tracking:</strong> Once your crochet friend is on the way, we will share the message with you via WhatsApp or email.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Returns Modal */}
      <Dialog open={returnsOpen} onOpenChange={setReturnsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Return Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-4 text-muted-foreground">
            <p>Due to the time-intensive, handmade nature of our products, we currently <strong>do not accept returns or exchanges</strong> for change of mind.</p>
            <p>However, we want you to absolutely love your croshru piece! If your item arrives damaged or there is an issue with your order, please reach out to us within 48 hours of delivery with photos of the item, and we will do our best to make it right.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQs Modal */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Frequently Asked Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-sm mt-4 text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground text-base">How do I wash my crochet items?</h4>
              <p className="mt-1">We recommend gentle spot-cleaning with mild soap and cold water. For a deeper clean, hand wash gently and lay flat to air dry. Please do not put them in a washing machine or dryer, as it may distort their shape!</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-base">Are these safe for babies?</h4>
              <p className="mt-1">While our plushies are soft, some items contain small plastic safety eyes which can be a choking hazard. Please supervise young children around these items.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-base">Can I request a different color?</h4>
              <p className="mt-1">Absolutely! If you love a design but want it in a specific color, use the "Custom Orders" form to let us know what you have in mind.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[26rem] bg-background border-l border-border shadow-warm flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-display text-2xl">Your basket</h3>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {count === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="text-4xl mb-3">🧺</div>
                  Your basket is empty — go pick a treasure.
                </div>
              )}
              {Object.entries(cart).map(([id, qty]) => {
                // 4. Added a safety check here to prevent crashes if a product is not found
                const p = products.find((x) => x.id === id);
                if (!p) return null;

                return (
                  <div key={id} className="flex gap-3 items-center">
                    <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-sm text-muted-foreground">${p.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => dec(id)} className="grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-secondary"><Minus size={12} /></button>
                      <span className="w-5 text-center text-sm">{qty}</span>
                      <button onClick={() => add(id)} className="grid h-7 w-7 place-items-center rounded-full border border-border hover:bg-secondary"><Plus size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <button
                disabled={count === 0}
                onClick={handleWhatsAppCheckout}
                className="w-full rounded-full bg-primary text-primary-foreground py-3.5 font-medium hover:opacity-90 transition disabled:opacity-40 flex justify-center items-center gap-2"
              >
                Order via WhatsApp
              </button>
              <div className="text-xs text-muted-foreground text-center">Wrapped with care · Ships in 2–4 days</div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}