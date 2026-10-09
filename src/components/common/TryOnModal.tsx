import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from './ImageWithFallback';
import { X, Sparkles, ShoppingBag, ArrowLeft, Info, MoveHorizontal, Camera } from 'lucide-react';

export const TryOnModal: React.FC = () => {
  const {
    isTryOnModalOpen,
    setIsTryOnModalOpen,
    tryOnProduct,
    addToCart,
    customerPhoto,
    personalizedTryOnUrl,
    personalizedTryOnProductId,
    setActiveView: setAppActiveView,
  } = useApp();

  const dress = tryOnProduct || PRODUCTS_DATA[0];

  // Check if a genuine personalized try-on result exists for this dress
  const hasPersonalizedTryOn =
    Boolean(personalizedTryOnUrl) &&
    (personalizedTryOnProductId === dress.id || !personalizedTryOnProductId);

  // Available genuine views for catalog dress (when personalized try-on is not active)
  const genuineViews = React.useMemo(() => {
    const list: Array<{ id: 'front' | 'left' | 'right' | 'back'; label: string; url: string }> = [
      { id: 'front', label: 'Front View', url: dress.images.front },
    ];
    if (dress.images.left && dress.images.left !== dress.images.front) {
      list.push({ id: 'left', label: 'Left Profile', url: dress.images.left });
    }
    if (dress.images.right && dress.images.right !== dress.images.front) {
      list.push({ id: 'right', label: 'Right Profile', url: dress.images.right });
    }
    if (dress.images.back && dress.images.back !== dress.images.front) {
      list.push({ id: 'back', label: 'Back View', url: dress.images.back });
    }
    return list;
  }, [dress]);

  const [activeViewId, setActiveViewId] = useState<'front' | 'left' | 'right' | 'back'>('front');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Reset to front view when modal opens or dress changes
  useEffect(() => {
    setActiveViewId('front');
  }, [dress.id, isTryOnModalOpen]);

  if (!isTryOnModalOpen) return null;

  // Resolve currently displayed image (NEVER use CSS rotateY or flat page flip)
  const currentImage = hasPersonalizedTryOn
    ? personalizedTryOnUrl!
    : genuineViews.find((v) => v.id === activeViewId)?.url || dress.images.front;

  const currentViewIndex = genuineViews.findIndex((v) => v.id === activeViewId);

  // Drag handlers for switching genuine views without 3D transforms
  const handlePointerDown = (clientX: number) => {
    if (hasPersonalizedTryOn || genuineViews.length <= 1) return;
    setIsDragging(true);
    setDragStartX(clientX);
  };

  const handlePointerUp = (clientX: number) => {
    if (!isDragging || hasPersonalizedTryOn || genuineViews.length <= 1) return;
    setIsDragging(false);
    const diff = clientX - dragStartX;
    const threshold = 40;
    if (diff < -threshold) {
      // Advance to next genuine view
      const nextIdx = (currentViewIndex + 1) % genuineViews.length;
      setActiveViewId(genuineViews[nextIdx].id);
    } else if (diff > threshold) {
      // Previous genuine view
      const prevIdx = (currentViewIndex - 1 + genuineViews.length) % genuineViews.length;
      setActiveViewId(genuineViews[prevIdx].id);
    }
  };

  const handleGoToFittingRoom = () => {
    setIsTryOnModalOpen(false);
    setAppActiveView('tryon');
    const el = document.getElementById('tryon');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-charcoal/90 backdrop-blur-md"
        onClick={() => setIsTryOnModalOpen(false)}
      />

      <div className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-ivory z-10 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-champagne/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-champagne animate-pulse" />
            <div>
              <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block">
                {hasPersonalizedTryOn ? 'Personalized AI Virtual Try-On' : 'Garment Multi-View Studio'}
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

        {/* View Controls & Status */}
        {hasPersonalizedTryOn ? (
          /* Personalized Try-On Mode: Only ONE genuine front view exists */
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="bg-burgundy text-champagne font-bold border border-champagne/40 shadow-sm px-4 py-2 rounded-xl text-xs font-brand uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-champagne" />
                <span>Your Personalized Try-On (Front View)</span>
              </span>
            </div>

            {/* Explicit Notice: Additional views are not available yet */}
            <div className="bg-plum/90 border border-champagne/30 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-center shadow-md">
              <Info className="w-4 h-4 text-champagne flex-shrink-0" />
              <p className="text-ivory/80 text-xs font-brand">
                <strong className="text-champagne">Additional views are not available yet.</strong>{' '}
                Our neural draping engine generates a high-precision frontal synthesis of your portrait.
              </p>
            </div>
          </div>
        ) : (
          /* Catalog Multi-View Mode: Real genuine photos switcher (NO fake 360 CSS rotation) */
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {genuineViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveViewId(view.id)}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-brand uppercase tracking-wider transition-all ${
                      activeViewId === view.id
                        ? 'bg-burgundy text-champagne font-bold border border-champagne/40 shadow-sm'
                        : 'bg-plum/60 text-ivory/70 hover:text-champagne border border-champagne/15'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>

              {genuineViews.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-ivory/60 font-brand">
                  <MoveHorizontal className="w-3.5 h-3.5 text-champagne" />
                  <span>Drag photo to change views</span>
                </div>
              )}
            </div>

            {/* When only 1 genuine catalog view exists */}
            {genuineViews.length <= 1 && (
              <div className="bg-plum/80 border border-champagne/20 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs text-center">
                <Info className="w-3.5 h-3.5 text-champagne/80 flex-shrink-0" />
                <span className="text-ivory/70 text-[11px]">
                  Additional views are not available yet for this catalog garment.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Display Stage - Clean Image Switcher without CSS rotateY or perspective */}
        <div
          className={`relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal border border-champagne/30 flex items-center justify-center select-none ${
            !hasPersonalizedTryOn && genuineViews.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onMouseUp={(e) => handlePointerUp(e.clientX)}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
        >
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <ImageWithFallback
              src={currentImage}
              alt={dress.name}
              aspectRatio="aspect-full"
              className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
            />
          </div>

          {/* Perspective Badge */}
          <div className="absolute top-4 left-4 bg-plum-dark/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-champagne/30 text-[10px] font-brand uppercase tracking-wider text-champagne z-10 shadow-luxury">
            {hasPersonalizedTryOn
              ? 'YOUR AI TRY-ON • FRONT'
              : `${activeViewId.toUpperCase()} VIEW`}
          </div>

          {hasPersonalizedTryOn && (
            <div className="absolute top-4 right-4 bg-burgundy/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-champagne/40 text-[10px] font-brand uppercase tracking-wider text-champagne z-10 shadow-luxury flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-champagne" />
              <span>Personalized drape</span>
            </div>
          )}
        </div>

        {/* Try-on CTA prompt if user has not tried on this dress with their photo */}
        {!hasPersonalizedTryOn && (
          <div className="bg-plum/60 border border-champagne/20 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-champagne flex-shrink-0" />
              <span className="text-ivory/80">
                {customerPhoto
                  ? 'Your portrait is ready. Generate your custom try-on in the AI Fitting Room.'
                  : 'Want to see this dress on your own photo? Upload your portrait in the AI Fitting Room.'}
              </span>
            </div>
            <button
              onClick={handleGoToFittingRoom}
              className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/30 font-brand text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors"
            >
              Open AI Fitting Room
            </button>
          </div>
        )}

        {/* Footer Actions */}
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
