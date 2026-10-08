import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Camera, Calendar, Sparkles, Palette, DollarSign, Check, ArrowRight } from 'lucide-react';

export const QuickStyleFinder: React.FC = () => {
  const { setActiveView } = useApp();

  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoType, setPhotoType] = useState<'upload' | 'camera' | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState('Bridal & Barat');
  const [selectedEvent, setSelectedEvent] = useState('Evening Grand Gala');
  const [selectedStyle, setSelectedStyle] = useState('Royal Heritage Couture');
  const [selectedBudget, setSelectedBudget] = useState('PKR 250,000+');

  const handleCreateLook = () => {
    setActiveView('stylist');
  };

  return (
    <section className="relative -mt-10 sm:-mt-14 z-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="glass-burgundy rounded-2xl p-6 sm:p-8 md:p-10 border border-champagne/30 shadow-luxury">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-champagne/15 gap-4">
          <div>
            <div className="flex items-center gap-2 text-champagne text-xs font-brand uppercase tracking-[0.25em] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Style Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-bold text-ivory tracking-tight">
              Find Your Perfect Look
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-md font-light leading-relaxed">
            Tell StyleMira AI what you are looking for. Our couture algorithm crafts your personalized Pakistani ensemble in seconds.
          </p>
        </div>

        {/* 6 Visual Input Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {/* Card 1: Upload Photo */}
          <button
            onClick={() => {
              setPhotoType('upload');
              setHasPhoto(true);
            }}
            className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-36 ${
              photoType === 'upload'
                ? 'bg-plum-light/80 border-champagne shadow-gold-subtle'
                : 'bg-plum-dark/60 border-champagne/20 hover:border-champagne/50 hover:bg-plum/40'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-burgundy/80 border border-champagne/30 flex items-center justify-center text-champagne">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ivory/50 block">Input 01</span>
              <p className="text-xs font-semibold text-ivory mt-0.5">Upload Photo</p>
              <span className="text-[10px] text-champagne-light">
                {photoType === 'upload' ? 'Photo Attached ✓' : 'Select from device'}
              </span>
            </div>
          </button>

          {/* Card 2: Camera */}
          <button
            onClick={() => {
              setPhotoType('camera');
              setHasPhoto(true);
            }}
            className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-36 ${
              photoType === 'camera'
                ? 'bg-plum-light/80 border-champagne shadow-gold-subtle'
                : 'bg-plum-dark/60 border-champagne/20 hover:border-champagne/50 hover:bg-plum/40'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-burgundy/80 border border-champagne/30 flex items-center justify-center text-champagne">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ivory/50 block">Input 02</span>
              <p className="text-xs font-semibold text-ivory mt-0.5">Live Camera</p>
              <span className="text-[10px] text-champagne-light">
                {photoType === 'camera' ? 'Camera Ready ✓' : 'Instant AI selfie'}
              </span>
            </div>
          </button>

          {/* Card 3: Occasion */}
          <div className="p-4 rounded-xl border border-champagne/20 bg-plum-dark/60 text-left flex flex-col justify-between h-36">
            <div className="w-8 h-8 rounded-lg bg-burgundy/80 border border-champagne/30 flex items-center justify-center text-champagne">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ivory/50 block">Occasion</span>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-ivory border-b border-champagne/30 focus:outline-none focus:border-champagne mt-0.5 cursor-pointer"
              >
                <option value="Bridal & Barat" className="bg-plum text-ivory">Bridal & Barat</option>
                <option value="Walima" className="bg-plum text-ivory">Walima Pastels</option>
                <option value="Mehndi & Mayo" className="bg-plum text-ivory">Mehndi & Mayo</option>
                <option value="Nikah" className="bg-plum text-ivory">Nikah Sacred Ivory</option>
                <option value="Engagement" className="bg-plum text-ivory">Engagement Glam</option>
                <option value="Luxury Pret / Eid" className="bg-plum text-ivory">Luxury Pret / Eid</option>
              </select>
            </div>
          </div>

          {/* Card 4: Event */}
          <div className="p-4 rounded-xl border border-champagne/20 bg-plum-dark/60 text-left flex flex-col justify-between h-36">
            <div className="w-8 h-8 rounded-lg bg-burgundy/80 border border-champagne/30 flex items-center justify-center text-champagne">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ivory/50 block">Event Type</span>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-ivory border-b border-champagne/30 focus:outline-none focus:border-champagne mt-0.5 cursor-pointer"
              >
                <option value="Bride (Own Wedding)" className="bg-plum text-ivory">Bride (Own Wedding)</option>
                <option value="Sister / Close Family" className="bg-plum text-ivory">Sister / Family</option>
                <option value="Evening Grand Gala" className="bg-plum text-ivory">Grand Gala</option>
                <option value="Intimate Daylight" className="bg-plum text-ivory">Intimate Daylight</option>
              </select>
            </div>
          </div>

          {/* Card 5: Style */}
          <div className="p-4 rounded-xl border border-champagne/20 bg-plum-dark/60 text-left flex flex-col justify-between h-36">
            <div className="w-8 h-8 rounded-lg bg-burgundy/80 border border-champagne/30 flex items-center justify-center text-champagne">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ivory/50 block">Style Vibe</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-ivory border-b border-champagne/30 focus:outline-none focus:border-champagne mt-0.5 cursor-pointer"
              >
                <option value="Royal Heritage Couture" className="bg-plum text-ivory">Royal Heritage</option>
                <option value="Minimalist Luxury" className="bg-plum text-ivory">Minimal Luxury</option>
                <option value="Modern Fusion" className="bg-plum text-ivory">Modern Fusion</option>
                <option value="Ethereal Shimmer" className="bg-plum text-ivory">Ethereal Shimmer</option>
              </select>
            </div>
          </div>

          {/* Card 6: Budget */}
          <div className="p-4 rounded-xl border border-champagne/20 bg-plum-dark/60 text-left flex flex-col justify-between h-36">
            <div className="w-8 h-8 rounded-lg bg-burgundy/80 border border-champagne/30 flex items-center justify-center text-champagne">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ivory/50 block">Investment</span>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-ivory border-b border-champagne/30 focus:outline-none focus:border-champagne mt-0.5 cursor-pointer"
              >
                <option value="PKR 50,000 - 100,000" className="bg-plum text-ivory">50k - 100k PKR</option>
                <option value="PKR 100,000 - 200,000" className="bg-plum text-ivory">100k - 200k PKR</option>
                <option value="PKR 200,000 - 350,000" className="bg-plum text-ivory">200k - 350k PKR</option>
                <option value="PKR 350,000+" className="bg-plum text-ivory">350k+ Heirloom</option>
              </select>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-ivory/70">
            <span className="w-2 h-2 rounded-full bg-champagne animate-ping" />
            <span>AI Neural Stylist loaded • Over 1,200 couture combinations mapped</span>
          </div>

          <button
            onClick={handleCreateLook}
            className="w-full sm:w-auto bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl shadow-gold-subtle hover:scale-105 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-plum" />
            <span>CREATE MY LOOK</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
