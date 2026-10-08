import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRENDS_2026_DATA } from '../../data/trends2026';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const FashionTrends2026: React.FC = () => {
  const { setActiveView } = useApp();
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);

  const selectedTrend = TRENDS_2026_DATA[activeTrendIndex];

  return (
    <section className="py-24 bg-ivory-warm text-plum relative overflow-hidden border-y border-plum/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Magazine Editorial Masthead */}
        <div className="border-b-2 border-plum/20 pb-8 mb-12 text-center">
          <div className="flex items-center justify-between text-[11px] font-brand tracking-[0.3em] uppercase text-mauve-deep mb-3">
            <span>STYLEMIRA AI COUTURE REPORT</span>
            <span className="hidden sm:inline">VOLUME IV • ISSUE 2026</span>
            <span>AUTUMN/SPRING FORECAST</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-editorial font-bold text-plum tracking-tight uppercase">
            2026 FASHION TRENDS
          </h2>
          <p className="text-sm sm:text-base font-cormorant italic text-burgundy max-w-2xl mx-auto mt-2">
            "A definitive editorial exploration into South Asian architectural draping, neo-Mughal palettes, and intelligent bespoke craftsmanship."
          </p>
        </div>

        {/* Featured Editorial Spotlight Spread */}
        <div className="bg-ivory-light rounded-2xl p-6 sm:p-10 border border-champagne/40 shadow-luxury mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Big Editorial Image */}
          <div className="lg:col-span-7 relative rounded-xl overflow-hidden shadow-xl aspect-[4/3] sm:aspect-[16/10]">
            <ImageWithFallback
              src={selectedTrend.image}
              alt={selectedTrend.title}
              fallbackCategory={selectedTrend.category}
              aspectRatio="aspect-[4/3] sm:aspect-[16/10]"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 text-ivory">
              <span className="text-[10px] font-brand uppercase tracking-[0.25em] text-champagne block">
                {selectedTrend.category}
              </span>
              <h3 className="text-2xl sm:text-4xl font-editorial font-bold">
                {selectedTrend.title}
              </h3>
            </div>
          </div>

          {/* Editorial Content Breakdown */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              <span className="text-[11px] font-brand uppercase tracking-[0.25em] text-burgundy font-bold block mb-2">
                Editorial Curatorial Note
              </span>
              <h4 className="text-2xl sm:text-3xl font-editorial font-bold text-plum leading-tight mb-4">
                The {selectedTrend.title} Phenomenon
              </h4>
              <p className="text-sm text-mauve-deep leading-relaxed font-light mb-6">
                {selectedTrend.description}
              </p>

              {/* Color Palette breakdown */}
              <div className="mb-6">
                <span className="text-[10px] font-brand uppercase tracking-wider text-plum/70 block mb-2">
                  Featured Color Spectrum
                </span>
                <div className="flex items-center gap-2.5">
                  {selectedTrend.colorPalette.map((hex, i) => (
                    <div key={i} className="group relative">
                      <div
                        className="w-7 h-7 rounded-full border border-plum/20 shadow-sm cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Design Elements */}
              <div>
                <span className="text-[10px] font-brand uppercase tracking-wider text-plum/70 block mb-2">
                  Runway Hallmarks
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTrend.keyElements.map((elem, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-blush-soft text-plum text-xs border border-plum/15 font-medium"
                    >
                      {elem}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('collections')}
              className="bg-plum hover:bg-burgundy text-champagne text-xs uppercase tracking-[0.2em] font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-champagne" />
              <span>Explore {selectedTrend.title} Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Magazine Card Carousel / Grid for all 9 Trends */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRENDS_2026_DATA.map((trend, idx) => (
            <div
              key={trend.id}
              onClick={() => setActiveTrendIndex(idx)}
              className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                activeTrendIndex === idx
                  ? 'bg-ivory-light border-champagne shadow-luxury scale-[1.02]'
                  : 'bg-ivory-light/70 border-plum/10 hover:border-champagne/60 hover:bg-ivory-light'
              }`}
            >
              <div className="flex gap-4 items-center mb-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-plum-dark">
                  <img
                    src={trend.image}
                    alt={trend.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-burgundy font-brand font-semibold block">
                    {trend.category}
                  </span>
                  <h4 className="font-editorial text-lg font-bold text-plum">
                    {trend.title}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-mauve-deep line-clamp-2 leading-relaxed">
                {trend.description}
              </p>

              <div className="mt-4 pt-3 border-t border-plum/10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-plum">
                <span>View Trend Edit</span>
                <span className="text-champagne-dark">0{idx + 1} →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
