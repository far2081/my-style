import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from './ImageWithFallback';
import { X, Sparkles, RotateCw, ShoppingBag, ArrowLeft } from 'lucide-react';

export const TryOnModal: React.FC = () => {
  const { isTryOnModalOpen, setIsTryOnModalOpen, tryOnProduct, addToCart, customerPhoto } = useApp();

  const dress = tryOnProduct || PRODUCTS_DATA[0];
  const [activeAngle, setActiveAngle] = useState<'front' | 'left' | 'right' | 'back' | '360'>('front');
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!isTryOnModalOpen) return null;

  // Base image: keep the EXACT same dress/portrait across all perspectives
  const getDisplayedImage = () => {
    return dress.images.front;
  };

  const getTransformStyle = (): React.CSSProperties => {
    if (activeAngle === '360') {
      return {
        transform: `perspective(1200px) rotateY(${rotationAngle}deg)`,
        transition: 'transform 0.1s ease-out',
      };
    }
    if (activeAngle === 'left') {
      return {
        transform: 'perspective(1000px) rotateY(-22deg) scale(1.02)',
        transition: 'transform 0.4s ease',
      };
    }
    if (activeAngle === 'right') {
      return {
        transform: 'perspective(1000px) rotateY(22deg) scale(1.02)',
        transition: 'transform 0.4s ease',
      };
    }
    if (activeAngle === 'back') {
      return {
        transform: 'perspective(1000px) rotateY(180deg) scale(1.02)',
        transition: 'transform 0.4s ease',
      };
    }
    return {
      transform: 'perspective(1000px) rotateY(0deg) scale(1)',
      transition: 'transform 0.4s ease',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-charcoal/90 backdrop-blur-md"
        onClick={() => setIsTryOnModalOpen(false)}
      />

      <div className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-ivory z-10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-champagne/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-champagne animate-pulse" />
            <div>
              <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block">
                Virtual Try-On • 360° Multi-View
              </span>
              <h3 className="font-editorial text-2xl font-bold uppercase">{dress.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTryOnModalOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-champagne bg-plum/60 hover:bg-burgundy px-3 py-1.5 rounded-xl border border-champagne/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setIsTryOnModalOpen(false)}
              className="p-2 text-ivory/70 hover:text-champagne transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center justify-center gap-2">
          {(['front', 'left', 'right', 'back', '360'] as const).map((ang) => (
            <button
              key={ang}
              onClick={() => {
                setActiveAngle(ang);
                if (ang === 'front') setRotationAngle(0);
                else if (ang === 'left') setRotationAngle(-22);
                else if (ang === 'right') setRotationAngle(22);
                else if (ang === 'back') setRotationAngle(180);
              }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-brand uppercase tracking-wider transition-all ${
                activeAngle === ang
                  ? 'bg-burgundy text-champagne font-bold border border-champagne/40 shadow-sm'
                  : 'bg-plum/60 text-ivory/70 hover:text-champagne'
              }`}
            >
              {ang === '360' ? '360° Multi-View' : `${ang} View`}
            </button>
          ))}
        </div>

        {/* Display Stage */}
        <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal border border-champagne/30 flex items-center justify-center">
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={getTransformStyle()}
          >
            <ImageWithFallback
              src={getDisplayedImage()}
              alt={dress.name}
              aspectRatio="aspect-full"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>

          <div className="absolute top-4 left-4 bg-plum-dark/90 px-3 py-1.5 rounded-lg border border-champagne/30 text-[10px] font-brand uppercase tracking-wider text-champagne z-10">
            {activeAngle === '360' ? `360° Multi-View (${rotationAngle}°)` : `${activeAngle.toUpperCase()} PERSPECTIVE`}
          </div>

          {/* 360 Rotation Control Bar - NEVER disappears on click */}
          {activeAngle === '360' && (
            <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 bg-plum-dark/95 backdrop-blur-md border border-champagne/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-20 shadow-2xl">
              <span className="text-[10px] text-champagne font-bold uppercase flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Rotate 360°
              </span>
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <span className="text-[10px] text-ivory/60">0°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotationAngle}
                  onChange={(e) => {
                    setRotationAngle(Number(e.target.value));
                  }}
                  className="w-full accent-champagne cursor-pointer"
                />
                <span className="text-[10px] text-champagne font-mono font-bold">{rotationAngle}°</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotationAngle((prev) => (prev - 45 + 360) % 360)}
                  className="px-2 py-1 rounded bg-plum text-[10px] text-champagne border border-champagne/20 hover:bg-burgundy transition-colors"
                >
                  -45°
                </button>
                <button
                  type="button"
                  onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
                  className="px-2 py-1 rounded bg-plum text-[10px] text-champagne border border-champagne/20 hover:bg-burgundy transition-colors"
                >
                  +45°
                </button>
                <button
                  type="button"
                  onClick={() => setRotationAngle(0)}
                  className="px-2 py-1 rounded bg-plum text-[10px] text-champagne border border-champagne/20 hover:bg-burgundy transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <span className="text-sm font-editorial font-bold text-champagne">
              PKR {dress.price.toLocaleString()}
            </span>
            <span className="text-xs text-ivory/60 block">{dress.fabric}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                addToCart(dress);
                setIsTryOnModalOpen(false);
              }}
              className="flex-1 sm:flex-none bg-champagne hover:bg-champagne-light text-plum font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-gold-subtle transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Look to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
