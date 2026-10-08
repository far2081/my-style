import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Sparkles, Grid, Eye, User } from 'lucide-react';
import { ViewMode } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const navButtons: {
    label: string;
    view: ViewMode;
    icon: React.ComponentType<{ className?: string }>;
    isCenter?: boolean;
  }[] = [
    { label: 'Home', view: 'home', icon: Home },
    { label: 'AI Stylist', view: 'stylist', icon: Sparkles },
    { label: 'Shop', view: 'collections', icon: Grid },
    { label: 'Try-On', view: 'tryon', icon: Eye, isCenter: true },
    { label: 'Account', view: 'account', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-plum-dark/95 backdrop-blur-lg border-t border-champagne/20 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navButtons.map((item) => {
          const isActive = activeView === item.view;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => setActiveView(item.view)}
                className="relative -top-3 flex flex-col items-center focus:outline-none group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 shadow-gold-subtle ${
                    isActive
                      ? 'bg-gradient-to-tr from-champagne via-champagne-light to-champagne text-plum font-bold border-champagne-light scale-110 shadow-gold-glow'
                      : 'bg-burgundy text-champagne border-champagne/40 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                <span
                  className={`text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${
                    isActive ? 'text-champagne' : 'text-ivory/60'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors focus:outline-none ${
                isActive ? 'text-champagne' : 'text-ivory/65 hover:text-champagne-light'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[9px] font-medium tracking-wider uppercase">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-champagne mt-0.5 shadow-gold-subtle" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
