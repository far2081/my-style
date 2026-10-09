import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from './ImageWithFallback';
import { X, Sparkles, RotateCw, ShoppingBag, Check, ArrowLeft } from 'lucide-react';

export const TryOnModal: React.FC = () => {
  const { isTryOnModalOpen, setIsTryOnModalOpen, tryOnProduct, addToCart } = useApp();

  const dress = tryOnProduct || PRODUCTS_DATA[0];
  const [activeAngle, setActiveAngle] = useState<'front' | 'left' | 'right' | 'back' | '360'>('front');
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!isTryOnModalOpen) return null;

  const getDisplayedImage = () => {
    if (activeAngle === 'back' && dress.images.back) return dress.images.back;
    if (activeAngle === 'left' && dress.images.left) return dress.images.left;
    if (activeAngle === 'right' && dress.images.right) return dress.images.right;
    return dress.images.front;
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
              onClick={() => setActiveAngle(ang)}
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
          <ImageWithFallback
            src={getDisplayedImage()}
            alt={dress.name}
            aspectRatio="aspect-full"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 bg-plum-dark/90 px-3 py-1.5 rounded-lg border border-champagne/30 text-[10px] font-brand uppercase tracking-wider text-champagne">
            {activeAngle === '360' ? '360° Multi-View Active' : `${activeAngle.toUpperCase()} PERSPECTIVE`}
          </div>

          {activeAngle === '360' && (
            <div className="absolute bottom-4 inset-x-6 bg-plum-dark/90 backdrop-blur-md border border-champagne/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <span className="text-[10px] text-champagne font-bold uppercase">Rotate 360°</span>
              <input
                type="range"
                min="0"
                max="360"
                value={rotationAngle}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRotationAngle(val);
                  if (val < 90) setActiveAngle('front');
                  else if (val < 180) setActiveAngle('left');
                  else if (val < 270) setActiveAngle('back');
                  else setActiveAngle('right');
                }}
                className="w-full accent-champagne cursor-pointer"
              />
              <span className="text-[10px] text-ivory/60">{rotationAngle}°</span>
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
