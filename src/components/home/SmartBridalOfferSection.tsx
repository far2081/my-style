import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Crown, Gift, ArrowRight, ShieldCheck } from 'lucide-react';

export const SmartBridalOfferSection: React.FC = () => {
  const { setActiveView, isBridalOfferEligible } = useApp();

  return (
    <section className="py-20 bg-gradient-to-r from-plum-dark via-burgundy to-plum-dark text-ivory relative overflow-hidden border-y border-champagne/30" id="offers">
      {/* Decorative Gold Shimmer Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-champagne/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="glass-burgundy rounded-3xl p-8 sm:p-12 md:p-16 border-2 border-champagne/40 shadow-2xl relative overflow-hidden">
          {/* Subtle gold watermarked crown */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <Crown className="w-96 h-96 text-champagne" />
          </div>

          <div className="max-w-3xl relative z-10">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum/80 text-champagne border border-champagne/50 text-[10px] font-brand uppercase tracking-[0.3em] mb-6 shadow-gold-subtle">
              <Gift className="w-3.5 h-3.5 text-champagne" />
              <span>Privileged Bridal Concierge</span>
            </div>

            {/* Headings per spec */}
            <h3 className="text-sm sm:text-base font-brand uppercase tracking-[0.3em] text-champagne-light mb-3">
              COMPLETE YOUR BRIDAL LOOK
            </h3>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase leading-[1.1] mb-6">
              FREE BRIDAL MAKEUP <br />
              <span className="gold-gradient-text">ON ELIGIBLE BRIDAL ORDERS</span>
            </h2>

            <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-light mb-8 max-w-2xl">
              When you craft your heirloom bridal ensemble with StyleMira AI, receive complimentary signature HD bridal makeup and skin prep by our accredited master beauty stylists.
            </p>

            {/* Dynamic Eligibility Indicator (Specification: Do NOT permanently hard-code the eligibility amount into the visual architecture; connected dynamically) */}
            <div className="bg-plum-dark/90 border border-champagne/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isBridalOfferEligible ? 'bg-champagne text-plum' : 'bg-mauve-deep text-ivory/70'
                }`}>
                  {isBridalOfferEligible ? '✓' : '•'}
                </div>
                <div>
                  <span className="text-xs font-semibold text-ivory block">
                    {isBridalOfferEligible
                      ? 'Congratulations! Your Bridal Order Qualifies for Free Bridal Makeup.'
                      : 'Curate your bridal ensemble to unlock this complimentary service.'}
                  </span>
                  <span className="text-[11px] text-champagne-light/75">
                    *Eligibility calculated dynamically based on active bridal suite configuration.
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="px-3 py-1 rounded-full bg-champagne/15 text-champagne border border-champagne/40 text-[10px] font-brand uppercase tracking-wider font-semibold">
                  {isBridalOfferEligible ? 'Unlocked ✓' : 'Dynamic Promotion'}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setActiveView('bridal')}
                className="w-full sm:w-auto bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.25em] px-8 py-4 rounded-xl shadow-gold-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-plum" />
                <span>BUILD QUALIFYING BRIDAL LOOK</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-ivory/60">
                <ShieldCheck className="w-4 h-4 text-champagne" />
                <span>Official StyleMira Couture Atelier Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
