import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NexoraLogo } from '../common/NexoraLogo';
import { Sparkles, ArrowRight, Shield, Award, Truck, Check } from 'lucide-react';
import { ViewMode } from '../../types';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-charcoal text-ivory/80 pt-20 pb-16 border-t border-champagne/20 relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-plum/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-burgundy/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Newsletter Section */}
        <div className="bg-plum-dark/80 border border-champagne/25 rounded-2xl p-8 lg:p-12 mb-16 shadow-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[11px] font-brand uppercase tracking-[0.3em] text-champagne block mb-2">
                Haute Couture Intelligence
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-editorial text-ivory tracking-tight mb-2">
                JOIN THE STYLEMIRA COMMUNITY
              </h3>
              <p className="text-xs sm:text-sm text-ivory/70 max-w-lg leading-relaxed">
                Receive private invitations to runway previews, bespoke seasonal bridal edits, and personalized styling recommendations curated by AI.
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="bg-burgundy/60 border border-champagne/40 rounded-xl p-4 flex items-center gap-3 text-champagne">
                  <Check className="w-5 h-5 text-champagne flex-shrink-0" />
                  <span className="text-xs tracking-wider uppercase font-medium">
                    Welcome to StyleMira Haute Couture Society. Check your inbox for your private preview token.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 bg-charcoal/90 border border-champagne/30 rounded-xl px-5 py-3 text-xs sm:text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-semibold text-xs uppercase tracking-widest px-7 py-3 rounded-xl transition-all shadow-gold-subtle hover:scale-[1.02] flex items-center justify-center gap-2 group"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 6 Columns Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Column 1: StyleMira AI */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <NexoraLogo size="sm" />
              <div>
                <span className="font-brand text-sm font-bold tracking-widest text-ivory block">
                  STYLEMIRA <span className="text-champagne font-light">AI</span>
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-champagne/60">
                  Fashion Tech
                </span>
              </div>
            </div>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Pioneering the intersection of authentic Pakistani haute couture and artificial intelligence.
            </p>
            <div className="flex items-center gap-3 text-champagne pt-1">
              <a href="#instagram" className="p-2 rounded-full bg-plum hover:bg-burgundy transition-colors" aria-label="Instagram">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#facebook" className="p-2 rounded-full bg-plum hover:bg-burgundy transition-colors" aria-label="Facebook">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z"/></svg>
              </a>
              <a href="#youtube" className="p-2 rounded-full bg-plum hover:bg-burgundy transition-colors" aria-label="YouTube">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-3">
            <h4 className="font-brand text-xs uppercase tracking-[0.2em] text-champagne font-bold">
              Shop
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <button onClick={() => setActiveView('collections')} className="hover:text-champagne transition-colors">
                  All Collections
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('bridal')} className="hover:text-champagne transition-colors">
                  Bridal Haute Couture
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('latest')} className="hover:text-champagne transition-colors">
                  Latest Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('collections')} className="hover:text-champagne transition-colors">
                  Festive & Mehndi
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('collections')} className="hover:text-champagne transition-colors">
                  Luxury Pret
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('collections')} className="hover:text-champagne transition-colors">
                  Hand-embroidered Shawls
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: AI Experiences */}
          <div className="space-y-3">
            <h4 className="font-brand text-xs uppercase tracking-[0.2em] text-champagne font-bold">
              AI Experiences
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <button onClick={() => setActiveView('stylist')} className="hover:text-champagne transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-champagne" />
                  <span>Personal AI Stylist</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('tryon')} className="hover:text-champagne transition-colors">
                  Virtual Try-On 360°
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('runway')} className="hover:text-champagne transition-colors">
                  Walk Your Look (Runway)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dress-studio')} className="hover:text-champagne transition-colors">
                  AI Dress Studio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('bridal')} className="hover:text-champagne transition-colors">
                  AI Makeup Studio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('trends')} className="hover:text-champagne transition-colors">
                  2026 Trend Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care */}
          <div className="space-y-3">
            <h4 className="font-brand text-xs uppercase tracking-[0.2em] text-champagne font-bold">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <button
                  onClick={() => {
                    alert('STYLEMIRA COUTURE SIZE GUIDE:\n\n• XS (Bust: 32", Waist: 25", Hips: 35")\n• S (Bust: 34", Waist: 27", Hips: 37")\n• M (Bust: 36", Waist: 29", Hips: 39")\n• L (Bust: 38", Waist: 31", Hips: 41")\n• XL (Bust: 41", Waist: 34", Hips: 44")\n\nCustom tailoring & bespoke sizing available upon consultation.');
                  }}
                  className="hover:text-champagne transition-colors text-left"
                >
                  Couture Size Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('stylist')}
                  className="hover:text-champagne transition-colors text-left"
                >
                  Bespoke Consultation
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    alert('GLOBAL INSURED SHIPPING:\n\n• Pakistan Domestic: Free 2-3 Day White-Glove TCS Express\n• International (USA, UK, UAE, Canada): 5-7 Day DHL Express Priority\n• All high-value bridal parcels are insured at 100% declared valuation.');
                  }}
                  className="hover:text-champagne transition-colors text-left"
                >
                  Global Shipping & Insured Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    alert('ZARDOZI & HEIRLOOM TEXTILE CARE:\n\n• Dry clean only with specialist luxury couture preservationists.\n• Store in the provided velvet acid-free preservation trunk.\n• Avoid direct contact with heavy perfumes and water moisture.');
                  }}
                  className="hover:text-champagne transition-colors text-left"
                >
                  Zardozi & Fabric Care
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    alert('FREQUENTLY ASKED QUESTIONS:\n\nQ: How does Virtual Try-On work?\nA: Upload a portrait and select any catalog dress for 360° neural silhouette fitting.\n\nQ: What are payment methods?\nA: Cash on Delivery (COD), Direct Bank Wire (HBL IBAN), and Stripe Online Card payments.');
                  }}
                  className="hover:text-champagne transition-colors text-left"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: My Account */}
          <div className="space-y-3">
            <h4 className="font-brand text-xs uppercase tracking-[0.2em] text-champagne font-bold">
              My Account
            </h4>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <button onClick={() => setActiveView('account')} className="hover:text-champagne transition-colors">
                  Client Profile
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('account')} className="hover:text-champagne transition-colors">
                  Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('wishlist')} className="hover:text-champagne transition-colors">
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dress-studio')} className="hover:text-champagne transition-colors">
                  Generated Looks
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('account')} className="hover:text-champagne transition-colors">
                  Bespoke Measurements
                </button>
              </li>
            </ul>
          </div>

          {/* Column 6: Contact */}
          <div className="space-y-3">
            <h4 className="font-brand text-xs uppercase tracking-[0.2em] text-champagne font-bold">
              Contact
            </h4>
            <div className="space-y-2 text-xs text-ivory/70">
              <p className="font-medium text-ivory">Flagship Bridal Atelier</p>
              <p>M.M. Alam Road, Gulberg III, Lahore, Pakistan</p>
              <p className="pt-1 text-champagne">Direct Line: +92 300 1234567</p>
              <p>Mon - Sat: 11:00 AM - 8:00 PM PKT</p>
            </div>
          </div>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-champagne/15 mb-12">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-champagne flex-shrink-0" />
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-ivory">Authentic Master Craftsmanship</p>
              <p className="text-[11px] text-ivory/60">Genuine hand zardozi, mukesh, and pure silk fabrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-champagne flex-shrink-0" />
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-ivory">Insured Worldwide Transit</p>
              <p className="text-[11px] text-ivory/60">Secure DHL Express delivery to USA, UK, UAE, Canada</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-champagne flex-shrink-0" />
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-ivory">Bespoke Fit Guarantee</p>
              <p className="text-[11px] text-ivory/60">Virtual 360 styling with master tailor verification</p>
            </div>
          </div>
        </div>

        {/* BOTTOM EXACT MANDATORY CREDIT */}
        {/* SPECIFICATION: At the bottom EVERY PAGE must show EXACTLY:
            Created by farhana Aamir
            farzunmir@gmail.com
            Do not alter these words. */}
        <div className="pt-6 text-center space-y-2">
          <p className="text-xs tracking-wider text-ivory font-serif">
            Created by farhana Aamir
          </p>
          <p className="text-xs tracking-wider text-champagne font-mono">
            farzunmir@gmail.com
          </p>
          <p className="text-[10px] text-ivory/40 tracking-[0.25em] uppercase pt-2">
            © 2026 STYLEMIRA AI • ALL RIGHTS RESERVED • NEXORA AI PLATFORM
          </p>
        </div>
      </div>
    </footer>
  );
};
