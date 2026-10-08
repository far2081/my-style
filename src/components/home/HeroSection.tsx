import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <section className="relative min-h-[92vh] sm:min-h-[95vh] flex items-center justify-center overflow-hidden bg-plum-dark">
      {/* Cinematic Pakistani Haute Couture Background Image with dark plum/burgundy gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85"
          alt="StyleMira AI Luxury Couture Campaign"
          className="w-full h-full object-cover object-top filter brightness-[0.7] contrast-[1.1] scale-105 animate-pulse-subtle"
        />
        {/* Layered cinematic gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-plum via-plum-dark/80 to-burgundy/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-plum-dark/95 via-plum/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-plum-dark/40 to-charcoal-dark/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20 lg:py-28 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
        {/* Small Luxury Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-burgundy/80 backdrop-blur-md border border-champagne/40 shadow-gold-subtle mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-champagne animate-pulse" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-[10px] sm:text-xs font-brand tracking-[0.25em] uppercase text-champagne font-semibold">
            <span>STYLEMIRA AI</span>
            <span className="hidden sm:inline text-champagne/40">•</span>
            <span className="text-ivory/90 tracking-[0.2em] font-normal">INTELLIGENT FASHION EXPERIENCE</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-editorial font-bold text-ivory tracking-tight uppercase leading-[1.05] max-w-4xl mb-6">
          YOUR STYLE. <br />
          <span className="gold-gradient-text italic font-cormorant font-normal lowercase tracking-normal text-5xl sm:text-7xl md:text-8xl lg:text-9xl block sm:inline">
            reimagined
          </span>{' '}
          <span className="text-ivory">BY AI.</span>
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-base md:text-lg text-ivory/80 max-w-2xl font-light leading-relaxed mb-10 tracking-wide">
          Discover the perfect look, virtually try it on, and experience authentic Pakistani haute couture designed around you.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Primary CTA */}
          <button
            onClick={() => setActiveView('stylist')}
            className="w-full sm:w-auto bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs sm:text-sm uppercase tracking-[0.2em] px-8 py-4 rounded-xl shadow-gold-glow hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <Sparkles className="w-4 h-4 text-plum" />
            <span>START AI STYLING</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => setActiveView('collections')}
            className="w-full sm:w-auto bg-plum/60 hover:bg-burgundy/80 backdrop-blur-md text-ivory hover:text-champagne border border-champagne/40 hover:border-champagne font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] px-8 py-4 rounded-xl shadow-luxury transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <Compass className="w-4 h-4 text-champagne" />
            <span>EXPLORE COLLECTION</span>
          </button>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-14 pt-8 border-t border-champagne/20 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl text-left">
          <div>
            <span className="text-2xl sm:text-3xl font-editorial font-bold text-champagne block">
              100%
            </span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60">
              Heirloom Artistry
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-editorial font-bold text-champagne block">
              360°
            </span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60">
              Virtual Try-On
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-editorial font-bold text-champagne block">
              16+
            </span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60">
              Pakistani Occasions
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-editorial font-bold text-champagne block">
              2026
            </span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60">
              Couture Forecast
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
