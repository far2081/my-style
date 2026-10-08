import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BRIDAL_ITEMS_DATA } from '../../data/bridalLooks';
import { Sparkles, Check, Crown, Diamond, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { BridalItem } from '../../types';

export const BridalStudioSection: React.FC = () => {
  const {
    selectedBridalItems,
    toggleBridalItem,
    bridalLookTotal,
    isBridalOfferEligible,
    addToCart,
    products,
    setTryOnProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('Bridal Dress');
  const [isSavedLook, setIsSavedLook] = useState(false);

  const categories = ['Bridal Dress', 'Makeup', 'Jewelry', 'Hair', 'Dupatta', 'Shoes', 'Accessories'] as const;

  const currentCategoryItem = BRIDAL_ITEMS_DATA.find((item) => item.category === activeTab) || BRIDAL_ITEMS_DATA[0];

  return (
    <section className="py-28 bg-gradient-to-b from-plum-dark via-burgundy-deep to-plum text-ivory relative overflow-hidden" id="bridal-studio">
      {/* Decorative Champagne Gold Filigree Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-champagne/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-plum/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy text-champagne border border-champagne/40 text-[10px] font-brand uppercase tracking-[0.3em] mb-4 shadow-gold-subtle">
            <Crown className="w-3.5 h-3.5 text-champagne" />
            <span>The Royal Atelier Suite</span>
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            YOUR COMPLETE BRIDAL LOOK
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-ivory/80 max-w-2xl mx-auto leading-relaxed font-light">
            Every bridal component harmonized under one imperial vision. Curate your dress, jewelry, bridal makeup, veil, and heirloom accessories with bespoke precision.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => {
            const isSelected = selectedBridalItems.some((i) => i.category === cat);
            const isActiveTab = activeTab === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-brand uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActiveTab
                    ? 'bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum font-bold shadow-gold-glow scale-105'
                    : isSelected
                    ? 'bg-burgundy text-champagne border border-champagne/40'
                    : 'bg-plum-dark/60 text-ivory/70 hover:text-champagne border border-champagne/15 hover:bg-plum/60'
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-champagne text-plum text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Featured Bridal Look Stage */}
        <div className="bg-plum-dark/90 border border-champagne/30 rounded-3xl p-6 sm:p-10 shadow-luxury mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Bridal Portrait Display */}
            <div className="lg:col-span-6 relative aspect-[3/4] rounded-2xl overflow-hidden border border-champagne/40 shadow-2xl bg-charcoal">
              <img
                src={currentCategoryItem.image}
                alt={currentCategoryItem.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/85 via-transparent to-transparent" />

              <div className="absolute top-4 left-4 bg-burgundy/80 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-lg text-[10px] font-brand tracking-widest uppercase text-champagne">
                {currentCategoryItem.category}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs uppercase tracking-widest text-champagne font-brand block mb-1">
                  Atelier Curation
                </span>
                <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-ivory mb-2">
                  {currentCategoryItem.name}
                </h3>
                <span className="text-xl font-editorial font-bold text-champagne">
                  PKR {currentCategoryItem.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right Curation Details & Builder Breakdown */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-xs font-brand tracking-[0.25em] uppercase text-champagne block mb-2">
                  Harmonized Element
                </span>
                <h4 className="text-3xl sm:text-4xl font-editorial font-bold text-ivory mb-4">
                  {currentCategoryItem.name}
                </h4>
                <p className="text-sm text-ivory/80 leading-relaxed font-light mb-6">
                  {currentCategoryItem.description}
                </p>

                <button
                  onClick={() => toggleBridalItem(currentCategoryItem)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-brand uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    selectedBridalItems.some((i) => i.name === currentCategoryItem.name)
                      ? 'bg-burgundy text-champagne border border-champagne/50 shadow-gold-subtle'
                      : 'bg-champagne hover:bg-champagne-light text-plum font-bold shadow-md'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {selectedBridalItems.some((i) => i.name === currentCategoryItem.name)
                      ? 'Included in Bridal Ensemble ✓'
                      : 'Add This Element to My Look'}
                  </span>
                </button>
              </div>

              {/* Current Ensemble Breakdown */}
              <div className="bg-charcoal/80 border border-champagne/25 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-champagne/15">
                  <span className="text-xs font-brand uppercase tracking-wider text-champagne font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Selected Bridal Suite ({selectedBridalItems.length}/7 Elements)</span>
                  </span>
                  <span className="text-xs text-ivory/60">
                    Bespoke Consultation Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const item = selectedBridalItems.find((i) => i.category === cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                          item
                            ? 'bg-plum border-champagne/40 text-ivory'
                            : 'bg-plum-dark/40 border-champagne/10 text-ivory/40 hover:border-champagne/30'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider text-champagne-light block">
                          {cat}
                        </span>
                        <p className="text-[11px] font-medium truncate">
                          {item ? item.name : '+ Select item'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Ensemble Total Price */}
                <div className="pt-3 border-t border-champagne/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-ivory/50 block">Complete Look Investment</span>
                    <span className="text-2xl font-editorial font-bold text-champagne">
                      PKR {bridalLookTotal.toLocaleString()}
                    </span>
                  </div>

                  {isBridalOfferEligible && (
                    <div className="bg-plum px-3 py-1.5 rounded-lg border border-champagne/30 text-right">
                      <span className="text-[9px] font-brand uppercase text-champagne font-bold block">
                        VIP Promotion Unlocked
                      </span>
                      <span className="text-[10px] text-ivory/80">
                        Complimentary HD Bridal Makeup Included ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main CTA */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsSavedLook(true)}
                  className="flex-1 bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.25em] py-4 rounded-xl shadow-gold-glow hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-plum" />
                  <span>BUILD MY BRIDAL LOOK</span>
                </button>

                <button
                  onClick={() => {
                    const bridalDress = products.find((p) => p.category.toLowerCase().includes('bridal')) || products[0];
                    if (bridalDress) setTryOnProduct(bridalDress);
                    const el = document.getElementById('tryon');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-4 rounded-xl bg-plum border border-champagne/40 hover:bg-burgundy text-champagne text-xs font-brand uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-champagne" />
                  <span>TRY IN VIRTUAL SUITE</span>
                </button>
              </div>

              {isSavedLook && (
                <div className="bg-burgundy/80 border border-champagne/40 rounded-xl p-4 text-xs text-champagne flex items-center gap-2">
                  <Check className="w-4 h-4 text-champagne" />
                  <span>
                    Your complete bridal suite has been logged in your client portal. A Senior Bridal Stylist will contact you for measurement verification.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
