'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
const FLAG = process.env.NEXT_PUBLIC_AFFILIATE_FLAG || 'PCTFS{pctfs_vip_coupon:R3S3CURITY143}';

const offers = [
  {
    id: 'aurora',
    name: 'Aurora Glow Kit',
    description: 'Bundle of our best-selling wellness gadgets wrapped in a holographic experience.',
    redirect: 'https://hackazon.com/campaigns/aurora-glow'
  },
  {
    id: 'velocity',
    name: 'Velocity Fitness Pack',
    description: 'High-impact active gear curated for urban athletes on the move.',
    redirect: 'https://hackazon.com/campaigns/velocity-fit'
  },
  {
    id: 'atelier',
    name: 'Atelier Home Studio',
    description: 'Design-forward workspace essentials crafted for creators and makers.',
    redirect: 'https://hackazon.com/campaigns/atelier-studio'
  }
];

export default function AffiliatePortal() {
  const searchParams = useSearchParams();
  const [notice, setNotice] = useState('');

  const [partnerName, setPartnerName] = useState('Cosmic Creatives');
  const [partnerCode, setPartnerCode] = useState('COSMIC-001');
  const [selectedOfferId, setSelectedOfferId] = useState(offers[0].id);
  const [customRedirect, setCustomRedirect] = useState(offers[0].redirect);
  const [copied, setCopied] = useState('');

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? offers[0],
    [selectedOfferId]
  );

  const baseRedirect = selectedOffer.redirect;
  const linkModified = customRedirect.trim() !== baseRedirect;

  const referralLink = useMemo(() => {
    const params = new URLSearchParams({
      partner_id: partnerCode || 'AFFILIATE',
      redirect: customRedirect
    });
    return `${API_BASE}/api/v1/track?${params.toString()}`;
  }, [partnerCode, customRedirect]);

  const handleOfferChange = (offerId) => {
    setSelectedOfferId(offerId);
    const offer = offers.find((o) => o.id === offerId);
    if (offer) {
      setCustomRedirect(offer.redirect);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied('Link copied!');
      setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('Unable to copy—select manually.');
      setTimeout(() => setCopied(''), 1600);
    }
  };

  const handleTestRedirect = () => {
    if (linkModified) {
      alert(`Flag: ${FLAG}`);
    }
    window.open(referralLink, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const marker = searchParams.get('notice');
    if (marker === 'external-blocked') {
      setNotice('External redirect blocked. External domains are disabled in this lab environment.');
    } else {
      setNotice('');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),rgba(15,23,42,0.95)_60%)]" />
        <div className="relative container mx-auto px-4 py-16 md:py-20 text-white">
          {notice && (
            <div className="mb-6">
              <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-lg shadow-amber-900/40">
                {notice}
              </div>
            </div>
          )}
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 uppercase text-xs tracking-[0.4em]">
              Affiliate
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Hyper-Stylized Referral Portal
            </h1>
            <p className="text-lg text-slate-200/80 leading-relaxed">
              Compose bespoke referral journeys, remix redirect targets on the fly, and watch performance sparkle.
              Tweak the destination to unlock an exclusive field-ops flag—perfect for researchers mapping open redirects.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-sky-200 hover:text-sky-100 transition"
            >
              ← Back to storefront
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 -mt-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Campaign Composer</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">LIVE BUILDER</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Partner Name</label>
                  <input
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Partner Code</label>
                  <input
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wide text-slate-400">Featured Offer</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      onClick={() => handleOfferChange(offer.id)}
                      className={`text-left rounded-2xl border p-4 transition ${
                        offer.id === selectedOfferId
                          ? 'border-sky-500/80 bg-sky-500/10 shadow-lg shadow-sky-900/30'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-semibold text-white mb-1">{offer.name}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{offer.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wide text-slate-400 flex items-center gap-2">
                  Redirect URL
                  {linkModified && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] uppercase tracking-wide">
                      modified
                    </span>
                  )}
                </label>
                <input
                  value={customRedirect}
                  onChange={(e) => setCustomRedirect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  Default: <span className="font-mono text-slate-300">{baseRedirect}</span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl p-6 md:p-8 space-y-5">
              <h3 className="text-lg font-semibold text-white">Shareable Referral Link</h3>
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 md:p-5">
                <code className="block text-sm text-sky-200 break-all">{referralLink}</code>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition"
                >
                  Copy Link
                </button>
                <button
                  onClick={handleTestRedirect}
                  className="px-4 py-2 rounded-full border border-slate-700 text-slate-200 text-sm hover:bg-slate-800 transition"
                >
                  Test Redirect
                </button>
              </div>
              {copied && <div className="text-xs text-slate-400">{copied}</div>}
              <div className="text-xs text-slate-500 leading-relaxed">
                Heads up: tweaking the destination reveals a special researcher flag before the backend proxy forwards the traffic.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-xl p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Performance Moodboard</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sculpt your campaigns with modular components. Swap creative assets, remix redirect targets, and broadcast seasonal
                journeys without waiting on engineering.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Next Milestone</div>
                <div className="mt-1 text-2xl font-bold text-white">{partnerName}</div>
                <div className="text-sm text-slate-400">Launches <span className="text-sky-300">{selectedOffer.name}</span></div>
              </div>
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Campaign Heat</span>
                  <span className="text-xs text-slate-500">+36% vs last week</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">quick tips</div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Band limited drops with micro influencers for amplified urgency.</li>
                  <li>• Rotate redirect destinations to spotlight limited-time merch.</li>
                  <li>• Inject personalized UTM tags to trace every spark of engagement.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
