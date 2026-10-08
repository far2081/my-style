import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { Play, Pause, Sun, Moon, Sparkles, ChevronLeft, ChevronRight, Eye, Camera, Lightbulb } from 'lucide-react';
import { aiProviders } from '../../services/aiProvider';

export const RunwaySection: React.FC = () => {
  const { setSelectedProduct } = useApp();

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeAngle, setActiveAngle] = useState<'Front' | 'Side' | 'Back'>('Front');
  const [lightingMode, setLightingMode] = useState<'spotlight' | 'golden' | 'moonlight' | 'glow'>('spotlight');
  const [outfitIndex, setOutfitIndex] = useState(0);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [runwayError, setRunwayError] = useState<string | null>(null);

  const currentOutfit = PRODUCTS_DATA[outfitIndex];

  const nextOutfit = () => {
    setOutfitIndex((prev) => (prev + 1) % PRODUCTS_DATA.length);
  };

  const prevOutfit = () => {
    setOutfitIndex((prev) => (prev - 1 + PRODUCTS_DATA.length) % PRODUCTS_DATA.length);
  };

  // Lighting overlay styles
  const getLightingStyle = () => {
    switch (lightingMode) {
      case 'golden':
        return 'from-amber-900/40 via-yellow-600/10 to-transparent';
      case 'moonlight':
        return 'from-slate-900/60 via-blue-900/20 to-transparent';
      case 'glow':
        return 'from-plum/60 via-burgundy/30 to-champagne/10';
      case 'spotlight':
      default:
        return 'from-black/80 via-transparent to-transparent';
    }
  };

  return (
    <section className="py-24 bg-charcoal text-ivory relative overflow-hidden" id="runway">
      {/* Stage Fog / Ambient glow */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-charcoal-dark via-plum-dark/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum/80 text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-4 shadow-gold-subtle">
            <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
            <span>Digital Haute Couture Fashion Week</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            WALK YOUR LOOK
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-ivory/70 max-w-2xl mx-auto leading-relaxed font-light">
            Step onto the Paris-Lahore virtual runway. Experience fluid fabric dynamics, atmospheric spotlights, and cinematic stage perspectives tailored to your bespoke ensemble.
          </p>
        </div>

        {/* Runway Stage Arena */}
        <div className="bg-charcoal-dark rounded-3xl overflow-hidden border border-champagne/30 shadow-2xl relative">
          {/* Main Visual Screen */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden flex items-center justify-center bg-black">
            {/* Model & Dress Image */}
            <img
              src={
                activeAngle === 'Back' && currentOutfit.images.back
                  ? currentOutfit.images.back
                  : activeAngle === 'Side' && currentOutfit.images.left
                  ? currentOutfit.images.left
                  : currentOutfit.images.front
              }
              alt={`${currentOutfit.name} on Runway`}
              className={`w-full h-full object-cover object-center filter contrast-[1.08] transition-transform duration-1000 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Dynamic Stage Lighting Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${getLightingStyle()} pointer-events-none transition-colors duration-700`} />

            {/* Spotlights Visual Beams */}
            <div className="absolute -top-10 left-1/4 w-32 h-[120%] bg-gradient-to-b from-champagne/25 via-transparent to-transparent rotate-12 blur-xl pointer-events-none" />
            <div className="absolute -top-10 right-1/4 w-32 h-[120%] bg-gradient-to-b from-champagne/25 via-transparent to-transparent -rotate-12 blur-xl pointer-events-none" />

            {/* Runway Floor Reflection effect */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-charcoal-dark via-plum-dark/60 to-transparent" />

            {/* Top Stage Header Overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-auto">
              <div className="bg-plum-dark/85 backdrop-blur-md border border-champagne/30 px-4 py-2 rounded-xl flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-brand tracking-[0.25em] uppercase text-champagne font-bold">
                  LIVE RUNWAY STREAM • 4K HDR
                </span>
              </div>

              <div className="bg-plum-dark/85 backdrop-blur-md border border-champagne/30 px-4 py-2 rounded-xl flex items-center gap-3">
                <span className="text-xs font-editorial text-ivory">
                  {currentOutfit.name}
                </span>
                <span className="text-champagne text-xs font-bold font-editorial">
                  PKR {currentOutfit.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Outfit Switch Arrows */}
            <button
              onClick={prevOutfit}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-plum-dark/70 hover:bg-plum border border-champagne/30 text-champagne flex items-center justify-center transition-transform hover:scale-110"
              aria-label="Previous Outfit"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextOutfit}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-plum-dark/70 hover:bg-plum border border-champagne/30 text-champagne flex items-center justify-center transition-transform hover:scale-110"
              aria-label="Next Outfit"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Active Perspective Badge */}
            <div className="absolute bottom-6 left-6 bg-burgundy/80 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-lg text-[10px] font-brand tracking-widest uppercase text-champagne">
              Camera: {activeAngle} Perspective ({lightingMode.toUpperCase()} Lighting)
            </div>
          </div>

          {/* Runway Control Console Bar */}
          <div className="p-6 bg-plum-dark border-t border-champagne/20 flex flex-wrap items-center justify-between gap-6">
            {/* Primary Action: Start / Pause Runway */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-gold-subtle hover:scale-105 transition-all flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-plum" />
                    <span>Pause Runway</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-plum" />
                    <span>Start Runway</span>
                  </>
                )}
              </button>

              <button
                onClick={nextOutfit}
                className="bg-burgundy/80 hover:bg-burgundy text-ivory border border-champagne/30 text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors"
              >
                Change Outfit
              </button>

              <button
                onClick={async () => {
                  setGeneratingVideo(true);
                  setRunwayError(null);
                  const res = await aiProviders.runway.generateRunway({
                    garmentImageUrl: currentOutfit.images.front,
                    lookTitle: currentOutfit.name,
                    stageLighting: lightingMode,
                    cameraPerspective: activeAngle,
                  });
                  setGeneratingVideo(false);
                  if (res.status === 'failed' && res.error) {
                    setRunwayError(res.error);
                  }
                }}
                className="bg-burgundy text-champagne border border-champagne/40 hover:bg-plum text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generatingVideo ? 'Synthesizing...' : 'Generate 4K AI Runway'}</span>
              </button>
            </div>

            {runwayError && (
              <div className="w-full bg-rose/20 border border-rose/30 text-rose text-xs p-3 rounded-xl text-center">
                {runwayError}
              </div>
            )}

            {/* Perspective View Controls: Front View, Side View, Back View */}
            <div className="flex items-center gap-2 bg-charcoal/80 p-1.5 rounded-xl border border-champagne/20">
              <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 px-2">
                Angle:
              </span>
              {(['Front', 'Side', 'Back'] as const).map((angle) => (
                <button
                  key={angle}
                  onClick={() => setActiveAngle(angle)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-brand uppercase tracking-wider transition-all ${
                    activeAngle === angle
                      ? 'bg-champagne text-plum font-bold shadow-sm'
                      : 'text-ivory/70 hover:text-champagne'
                  }`}
                >
                  {angle} View
                </button>
              ))}
            </div>

            {/* Lighting Controls: Spotlight, Golden Hour, Moonlight, Runway Glow */}
            <div className="flex items-center gap-2 bg-charcoal/80 p-1.5 rounded-xl border border-champagne/20">
              <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 px-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-champagne" />
                <span>Lighting:</span>
              </span>
              {(
                [
                  { id: 'spotlight', label: 'Spotlight' },
                  { id: 'golden', label: 'Golden Hour' },
                  { id: 'moonlight', label: 'Moonlight' },
                  { id: 'glow', label: 'Runway Glow' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLightingMode(mode.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-brand uppercase tracking-wider transition-all ${
                    lightingMode === mode.id
                      ? 'bg-burgundy text-champagne font-bold border border-champagne/40'
                      : 'text-ivory/60 hover:text-champagne'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
