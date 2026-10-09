import React from 'react';
import { useApp } from '../../context/AppContext';
import { OCCASIONS_DATA } from '../../data/occasions';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const ShopByOccasion: React.FC = () => {
  const { setActiveView, setActiveFilterOccasion, setActiveFilterEvent, setSelectedCollection, eventCollections } = useApp();

  const handleSelectOccasion = (name: string) => {
    const matchedCol = eventCollections.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() || c.slug.toLowerCase() === name.toLowerCase()
    );
    if (matchedCol) {
      setSelectedCollection(matchedCol);
      setActiveFilterEvent(matchedCol.name);
    }
    setActiveFilterOccasion(name);
    setActiveView('collections');
  };

  return (
    <section className="py-24 bg-ivory text-plum relative overflow-hidden">
      {/* Subtle luxury ambient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A86A_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum/10 text-plum border border-plum/20 text-[10px] font-brand uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-3 h-3 text-champagne-dark" />
            <span>Curated For Every Milestone</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-plum tracking-tight uppercase mb-4">
            SHOP BY OCCASION
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-mauve-deep max-w-xl mx-auto leading-relaxed font-light">
            From the sacred tranquility of the Nikah to the royal fanfare of the Barat, experience bespoke Pakistani couture tailored for every celebratory chapter.
          </p>
        </div>

        {/* 16 Occasions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {OCCASIONS_DATA.map((occ) => (
            <div
              key={occ.id}
              onClick={() => handleSelectOccasion(occ.name)}
              className="group relative bg-ivory-light rounded-xl overflow-hidden border border-plum/10 hover:border-champagne/80 shadow-sm hover:shadow-luxury transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Area with Zoom */}
              <div className="relative aspect-[3/4] overflow-hidden bg-plum-dark/10">
                <ImageWithFallback
                  src={occ.image}
                  alt={occ.name}
                  fallbackCategory={occ.name}
                  aspectRatio="aspect-[3/4]"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Subtle bottom vignette to ensure text contrast while keeping dresses bright and vibrant */}
                <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/80 via-transparent to-transparent opacity-75 group-hover:opacity-60 transition-opacity" />

                {/* Badge if available */}
                {occ.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-plum/85 backdrop-blur-md text-champagne border border-champagne/30 text-[9px] font-brand uppercase tracking-wider font-semibold">
                    {occ.badge}
                  </span>
                )}

                {/* Floating Arrow icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ivory/80 backdrop-blur-md text-plum flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-sm">
                  <ArrowUpRight className="w-4 h-4 text-plum" />
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-3 left-4 right-4 text-ivory">
                  <span className="text-[10px] uppercase tracking-widest text-champagne-light block">
                    {occ.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-editorial font-bold tracking-wide">
                    {occ.name}
                  </h3>
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="p-4 bg-ivory-light flex flex-col justify-between flex-grow">
                <p className="text-xs text-mauve-deep line-clamp-2 leading-relaxed mb-4">
                  {occ.description}
                </p>

                <div className="pt-2 border-t border-plum/10 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-plum group-hover:text-burgundy transition-colors">
                  <span>Explore Edit</span>
                  <span className="text-champagne font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
