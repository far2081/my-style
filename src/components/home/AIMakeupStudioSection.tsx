import React, { useState } from 'react';
import { MAKEUP_PRESETS_DATA } from '../../data/makeupPresets';
import { Sparkles, Sliders, Check, Wand2, Upload, AlertCircle } from 'lucide-react';
import { aiProviders } from '../../services/aiProvider';

export const AIMakeupStudioSection: React.FC = () => {
  const [activePresetId, setActivePresetId] = useState('bridal');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [skinFinish, setSkinFinish] = useState<'Dewy Velvet' | 'Matte Porcelain' | 'Luminous Satin'>('Dewy Velvet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [makeupStatus, setMakeupStatus] = useState<string | null>(null);
  const [makeupError, setMakeupError] = useState<string | null>(null);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  const selectedPreset = MAKEUP_PRESETS_DATA.find((p) => p.id === activePresetId) || MAKEUP_PRESETS_DATA[0];

  const handleApplyMakeup = async () => {
    setIsProcessing(true);
    setMakeupError(null);
    setMakeupStatus(null);

    const res = await aiProviders.makeup.generateMakeup({
      customerPhotoUrl: customPhoto || selectedPreset.beforeImage,
      presetStyle: selectedPreset.name,
      skinFinish,
    });

    setIsProcessing(false);
    if (res.status === 'failed') {
      setMakeupError(res.error || 'Failed to harmonize facial aesthetics.');
    } else {
      setMakeupStatus(`Successfully applied ${selectedPreset.name} (${skinFinish}) to your beauty profile!`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomPhoto(reader.result);
          setMakeupStatus('Custom portrait loaded for neural harmonizing.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="py-24 bg-plum-dark text-ivory relative overflow-hidden" id="makeup-studio">
      {/* Decorative ambient background */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-burgundy/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-4 shadow-gold-subtle">
            <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
            <span>Virtual Beauty-Tech Laboratory</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            AI MAKEUP STUDIO
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-ivory/70 max-w-2xl mx-auto leading-relaxed font-light">
            Real-time neural facial harmonizer. Preview signature Pakistani bridal and glam aesthetics before stepping into the salon.
          </p>
        </div>

        {/* 8 Preset Options Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {MAKEUP_PRESETS_DATA.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActivePresetId(preset.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-brand uppercase tracking-wider transition-all ${
                activePresetId === preset.id
                  ? 'bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum font-bold shadow-gold-glow scale-105'
                  : 'bg-plum/70 text-ivory/80 border border-champagne/20 hover:border-champagne/60 hover:text-champagne'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Interactive Before/After Studio Workbench */}
        <div className="bg-plum/80 border border-champagne/30 rounded-3xl p-6 sm:p-10 shadow-luxury max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Before/After Visual Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-champagne/40 shadow-2xl bg-charcoal select-none">
                {/* After Image (Full background) */}
                <img
                  src={selectedPreset.afterImage}
                  alt={`${selectedPreset.name} Makeup Look`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Before Image (Clipped by slider) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={selectedPreset.beforeImage}
                    alt="Natural Canvas"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%', minWidth: '100%' }}
                  />
                  {/* Before label */}
                  <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded text-[10px] font-brand uppercase tracking-wider text-ivory border border-white/20">
                    Natural Canvas (Before)
                  </div>
                </div>

                {/* After label */}
                <div className="absolute top-4 right-4 bg-burgundy/85 backdrop-blur-md px-3 py-1 rounded text-[10px] font-brand uppercase tracking-wider text-champagne border border-champagne/30">
                  {selectedPreset.name} Glam (After)
                </div>

                {/* Interactive Split Divider Line */}
                <div
                  className="absolute inset-y-0 w-1 bg-champagne shadow-[0_0_10px_rgba(201,168,106,0.8)] pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-8 h-8 rounded-full bg-champagne text-plum font-bold flex items-center justify-center text-xs shadow-lg border-2 border-plum">
                    ↔
                  </div>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="bg-plum-dark/80 p-3 rounded-xl border border-champagne/20 flex items-center gap-4">
                <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/60">
                  Before
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="w-full accent-champagne cursor-pointer"
                  aria-label="Before and After Slider"
                />
                <span className="text-[10px] uppercase font-brand tracking-wider text-champagne font-bold">
                  After
                </span>
              </div>
            </div>

            {/* Right Beauty-Tech Diagnostics Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-brand tracking-[0.25em] uppercase text-champagne block mb-1">
                  Preset Profile
                </span>
                <h3 className="text-3xl font-editorial font-bold text-ivory mb-2">
                  {selectedPreset.name}
                </h3>
                <p className="text-xs font-serif italic text-champagne-light mb-4">
                  "{selectedPreset.tagline}"
                </p>
                <p className="text-xs sm:text-sm text-ivory/75 leading-relaxed font-light mb-6">
                  {selectedPreset.description}
                </p>
              </div>

              {/* Pigment Palette Swatches */}
              <div className="bg-charcoal/80 border border-champagne/20 rounded-xl p-4">
                <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  Analyzed Harmonious Pigments
                </span>
                <div className="flex items-center gap-3">
                  {selectedPreset.palette.map((hex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full border border-champagne/30 shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Controls: Skin Finish */}
              <div className="bg-charcoal/80 border border-champagne/20 rounded-xl p-4">
                <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  Skin Texture Finish
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Dewy Velvet', 'Matte Porcelain', 'Luminous Satin'] as const).map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSkinFinish(finish)}
                      className={`py-2 px-2 rounded text-[10px] uppercase font-brand font-semibold transition-all ${
                        skinFinish === finish
                          ? 'bg-burgundy text-champagne border border-champagne/40'
                          : 'bg-plum-dark/60 text-ivory/60 hover:text-ivory'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Option */}
              <div className="bg-charcoal/80 border border-champagne/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block font-bold">
                    Custom Portrait
                  </span>
                  <span className="text-[11px] text-ivory/60">
                    {customPhoto ? 'Custom photo attached' : 'Test on your own portrait'}
                  </span>
                </div>
                <label className="cursor-pointer bg-plum hover:bg-burgundy text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-wider px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{customPhoto ? 'Change' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {makeupError && (
                <div className="bg-rose/20 border border-rose/30 text-rose text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{makeupError}</span>
                </div>
              )}

              {makeupStatus && (
                <div className="bg-champagne/20 border border-champagne/40 text-champagne text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{makeupStatus}</span>
                </div>
              )}

              <button
                onClick={handleApplyMakeup}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-gold-subtle hover:scale-102 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 text-plum" />
                <span>{isProcessing ? 'Harmonizing Pigments...' : 'Apply & Save To My Bridal Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
