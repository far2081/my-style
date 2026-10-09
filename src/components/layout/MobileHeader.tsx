import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NexoraLogo } from '../common/NexoraLogo';
import { Search, ShoppingBag, Menu, X, Sparkles, Crown, Layers, Sparkle, ArrowLeft } from 'lucide-react';
import { ViewMode } from '../../types';

export const MobileHeader: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
  } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems: { label: string; view: ViewMode; badge?: string }[] = [
    { label: 'Home', view: 'home' },
    { label: 'AI Personal Stylist', view: 'stylist', badge: 'AI' },
    { label: 'Couture Collections', view: 'collections' },
    { label: 'Latest Dresses', view: 'latest', badge: 'New' },
    { label: '2026 Fashion Trends', view: 'trends' },
    { label: 'Virtual Try-On 360°', view: 'tryon', badge: 'Interactive' },
    { label: 'Bridal Studio', view: 'bridal', badge: 'Royal' },
    { label: 'Runway Experience', view: 'runway', badge: 'Cinematic' },
    { label: 'AI Dress Studio', view: 'dress-studio', badge: 'Generative' },
    { label: 'Smart Bridal Offers', view: 'offers' },
    { label: 'My Saved Wishlist', view: 'wishlist' },
    { label: 'My Account Dashboard', view: 'account' },
    { label: 'Studio Admin Portal', view: 'admin' },
  ];

  const handleNavClick = (view: ViewMode) => {
    setActiveView(view);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-charcoal text-champagne text-[9px] tracking-[0.2em] uppercase py-1.5 px-3 text-center font-medium border-b border-champagne/15 flex items-center justify-center gap-1.5">
        <Sparkles className="w-2.5 h-2.5 text-champagne" />
        <span>AI FASHION TECH • LUXURY PAKISTANI COUTURE</span>
      </div>

      {/* Main Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-plum-dark/95 backdrop-blur-md border-b border-champagne/20 px-4 py-2.5 flex items-center justify-between">
        {/* Left: Back Button or EXACT NEXORA AI LOGO */}
        <div className="flex-1 flex items-center justify-start gap-2">
          {activeView !== 'home' ? (
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setActiveView('home');
                }
              }}
              className="p-1.5 rounded-lg bg-burgundy text-champagne border border-champagne/40 flex items-center gap-1 text-[10px] font-brand uppercase tracking-wider"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center focus:outline-none"
              aria-label="Home"
            >
              <NexoraLogo size="sm" />
            </button>
          )}
        </div>

        {/* Center: STYLEMIRA AI */}
        <div className="flex-[2] flex flex-col items-center justify-center text-center">
          <button
            onClick={() => setActiveView('home')}
            className="font-brand text-sm sm:text-base font-bold tracking-[0.25em] text-ivory hover:text-champagne transition-colors"
          >
            STYLEMIRA <span className="text-champagne">AI</span>
          </button>
          <span className="text-[8px] uppercase tracking-[0.25em] text-champagne/70 -mt-0.5">
            Haute Couture
          </span>
        </div>

        {/* Right: Search, Cart, Menu */}
        <div className="flex-1 flex items-center justify-end gap-2 text-ivory">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 text-ivory/80 hover:text-champagne focus:outline-none"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 text-ivory/80 hover:text-champagne focus:outline-none"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-champagne text-plum font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 text-champagne hover:text-champagne-light focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-plum-dark border-l border-champagne/25 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-champagne/15">
                <div className="flex items-center gap-2">
                  <NexoraLogo size="sm" />
                  <span className="font-brand text-xs tracking-widest text-champagne font-bold">
                    STYLEMIRA AI
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-ivory/70 hover:text-champagne focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => handleNavClick(item.view)}
                    className={`w-full text-left py-2.5 px-3 rounded text-xs tracking-wider uppercase font-medium flex items-center justify-between transition-colors ${
                      activeView === item.view
                        ? 'bg-burgundy text-champagne font-bold border-l-2 border-champagne'
                        : 'text-ivory/80 hover:bg-plum/50 hover:text-champagne'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-champagne/15 text-champagne border border-champagne/30 uppercase tracking-widest">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-champagne/15 text-[10px] text-ivory/50 space-y-2">
              <p className="text-champagne font-medium">Bespoke Bridal Consultations</p>
              <p>+92 300 1234567 • Farhana Aamir Studio</p>
              <p className="text-[9px] text-ivory/40">farzunmir@gmail.com</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
