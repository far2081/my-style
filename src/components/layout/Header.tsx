import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NexoraLogo } from '../common/NexoraLogo';
import { Search, Heart, User, ShoppingBag, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ViewMode } from '../../types';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    wishlist,
    setIsSearchOpen,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; view: ViewMode; isSpecial?: boolean }[] = [
    { label: 'Home', view: 'home' },
    { label: 'AI Stylist', view: 'stylist', isSpecial: true },
    { label: 'Collections', view: 'collections' },
    { label: 'Latest Dresses', view: 'latest' },
    { label: '2026 Trends', view: 'trends' },
    { label: 'Virtual Try-On', view: 'tryon', isSpecial: true },
    { label: 'Bridal Studio', view: 'bridal' },
    { label: 'Runway', view: 'runway', isSpecial: true },
    { label: 'Offers', view: 'offers' },
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-50 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-charcoal text-champagne text-[11px] tracking-[0.25em] uppercase py-2 px-6 border-b border-champagne/15 text-center font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 text-ivory/60 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
          <span>Haute Couture Guarantee & Free Worldwide Insured Shipping</span>
        </div>
        <div className="flex items-center gap-3">
          <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
          <span className="font-semibold tracking-[0.3em]">
            AI PERSONAL STYLING • VIRTUAL TRY-ON • BRIDAL BEAUTY STUDIO
          </span>
          <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
        </div>
        <div className="text-[10px] text-ivory/60">
          <button
            onClick={() => setActiveView('admin')}
            className="hover:text-champagne transition-colors underline decoration-champagne/30"
          >
            Studio Portal
          </button>
        </div>
      </div>

      {/* Main Sticky Luxury Glass Header */}
      <div
        className={`px-8 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-plum-dark/95 backdrop-blur-md border-champagne/20 py-3 shadow-luxury'
            : 'bg-plum/90 backdrop-blur-sm border-champagne/15 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Left: Back Button + EXACT NEXORA AI LOGO + Brand Name */}
          <div className="flex items-center gap-3">
            {activeView !== 'home' && (
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    setActiveView('home');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-burgundy/80 hover:bg-burgundy text-champagne border border-champagne/40 text-xs font-brand uppercase tracking-wider transition-all hover:scale-105 shadow-sm"
                title="Go Back to Previous Page"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-champagne" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-4 group text-left focus:outline-none"
            >
              {/* EXACT NEXORA AI LOGO */}
              <div className="p-1 rounded bg-black/20 border border-champagne/20 flex items-center justify-center">
                <NexoraLogo size="sm" />
              </div>

              <div className="flex flex-col">
                <span className="font-brand text-lg font-bold tracking-[0.22em] text-ivory group-hover:text-champagne transition-colors">
                  STYLEMIRA <span className="text-champagne font-light">AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.35em] text-champagne-light/75">
                  Couture Fashion Studio
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation */}
          <nav className="flex items-center gap-5 xl:gap-7">
            {navItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`relative py-1 text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200 group focus:outline-none ${
                    isActive
                      ? 'text-champagne font-semibold'
                      : 'text-ivory/80 hover:text-champagne-light'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.isSpecial && (
                      <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                    )}
                  </span>
                  {/* Gold active indicator */}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-champagne via-champagne-light to-champagne transition-all duration-300 ${
                      isActive ? 'w-full opacity-100 shadow-gold-subtle' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-60'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-5 text-ivory">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-ivory/80 hover:text-champagne hover:bg-burgundy/40 rounded-full transition-all focus:outline-none"
              title="Search Collections"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setActiveView('wishlist')}
              className="relative p-2 text-ivory/80 hover:text-champagne hover:bg-burgundy/40 rounded-full transition-all focus:outline-none"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute 1 top-0 right-0 w-4 h-4 bg-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account */}
            <button
              onClick={() => setActiveView('account')}
              className={`p-2 rounded-full transition-all focus:outline-none ${
                activeView === 'account'
                  ? 'text-champagne bg-burgundy/60'
                  : 'text-ivory/80 hover:text-champagne hover:bg-burgundy/40'
              }`}
              title="My Account"
              aria-label="Account"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-burgundy to-plum-light hover:from-burgundy-light hover:to-plum px-3.5 py-1.5 rounded-full border border-champagne/30 text-champagne shadow-gold-subtle transition-all duration-300 hover:scale-105 focus:outline-none"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-champagne text-plum font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
