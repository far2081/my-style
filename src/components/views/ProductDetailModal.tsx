import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { X, Sparkles, Heart, ShoppingBag, Eye, ShieldCheck, Ruler, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Product } from '../../types';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setTryOnProduct,
    setIsTryOnModalOpen,
    setIsCheckoutOpen,
  } = useApp();

  const [activeImageKey, setActiveImageKey] = useState<string>('front');
  const [selectedSize, setSelectedSize] = useState<string>('M');

  if (!selectedProduct) return null;

  const wishlisted = isInWishlist(selectedProduct.id);

  // Available image angles based on spec: Front, Back, Left, Right, Full Look, Detail, Fabric Detail, Close Up, 360 Multi-View
  const imageViews = selectedProduct.gallery && selectedProduct.gallery.length > 0
    ? selectedProduct.gallery.map((img) => ({
        key: img.id,
        label: img.imageType === '360 Multi-View' ? '360° Multi-View' : img.imageType,
        src: img.imageUrl,
        is360: img.imageType === '360 Multi-View',
      }))
    : [
        { key: 'front', label: 'Front View', src: selectedProduct.images.front, is360: false },
        { key: 'back', label: 'Back View', src: selectedProduct.images.back || selectedProduct.images.front, is360: false },
        { key: 'left', label: 'Left Profile', src: selectedProduct.images.left || selectedProduct.images.front, is360: false },
        { key: 'right', label: 'Right Profile', src: selectedProduct.images.right || selectedProduct.images.front, is360: false },
        { key: 'detail', label: 'Artisan Detail', src: selectedProduct.images.detail || selectedProduct.images.front, is360: false },
        { key: 'fabric', label: 'Fabric Texture', src: selectedProduct.images.fabricDetail || selectedProduct.images.front, is360: false },
        { key: '360', label: '360° Multi-View', src: selectedProduct.images.multiView360 || selectedProduct.images.front, is360: true },
      ];

  const currentDisplaySrc = imageViews.find((v) => v.key === activeImageKey)?.src || imageViews[0]?.src || selectedProduct.images.front;

  const handleBuyNow = () => {
    addToCart(selectedProduct, selectedSize);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleVirtualTryOn = () => {
    setTryOnProduct(selectedProduct);
    setSelectedProduct(null);
    setIsTryOnModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/90 backdrop-blur-md transition-opacity"
        onClick={() => setSelectedProduct(null)}
      />

      {/* Modal Dialog Content */}
      <div className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 text-ivory z-10">
        {/* Modal Top Bar with Back and Close */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-champagne/20">
          <button
            onClick={() => setSelectedProduct(null)}
            className="inline-flex items-center gap-2 text-xs font-brand uppercase tracking-wider text-champagne hover:text-ivory bg-plum/70 hover:bg-burgundy px-3.5 py-1.5 rounded-xl border border-champagne/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-champagne" />
            <span>Back to Collection</span>
          </button>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-2 rounded-full bg-plum/80 text-ivory/80 hover:text-champagne hover:bg-burgundy border border-champagne/20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Large Image Gallery with Views (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-charcoal border border-champagne/30 shadow-lg">
              <ImageWithFallback
                src={currentDisplaySrc}
                alt={selectedProduct.name}
                aspectRatio="aspect-[3/4]"
                className="w-full h-full object-cover"
              />

              {/* Angle Pill */}
              <div className="absolute top-4 left-4 bg-plum-dark/90 backdrop-blur-md border border-champagne/30 px-3 py-1 rounded-full text-[10px] font-brand uppercase tracking-wider text-champagne">
                {activeImageKey === '360' ? '360° Multi-View Active' : `${activeImageKey.toUpperCase()} VIEW`}
              </div>
            </div>

            {/* View Selector Thumbnails */}
            {/* Views: Front, Back, Left, Right, Detail, Fabric, 360° Multi-View */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {imageViews.map((view) => (
                <button
                  key={view.key}
                  onClick={() => setActiveImageKey(view.key)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-brand uppercase tracking-wider transition-all border ${
                    activeImageKey === view.key
                      ? 'bg-burgundy text-champagne border-champagne font-bold shadow-gold-subtle'
                      : 'bg-plum/60 text-ivory/70 border-champagne/15 hover:border-champagne/50'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details, Sizing, Pricing & Buttons (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-brand uppercase tracking-widest text-champagne mb-1">
                <span>{selectedProduct.category}</span>
                <span>{selectedProduct.occasion}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-ivory leading-tight mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-champagne-light/80 italic font-serif mb-3">
                {selectedProduct.subtitle}
              </p>

              {/* Price & Availability */}
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-2xl sm:text-3xl font-editorial font-bold text-champagne">
                  PKR {selectedProduct.price.toLocaleString()}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-ivory/40 line-through">
                    PKR {selectedProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy/80 text-champagne text-[10px] uppercase font-semibold border border-champagne/30">
                <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
                <span>{selectedProduct.availability}</span>
              </div>
            </div>

            {/* Description & Fabric Details */}
            <div className="space-y-2 text-xs text-ivory/80 leading-relaxed font-light border-y border-champagne/15 py-4">
              <p>{selectedProduct.description}</p>
              <div className="pt-2 text-[11px] text-champagne-light">
                <strong>Fabric:</strong> {selectedProduct.fabric}
              </div>
              <div className="text-[11px] text-champagne-light">
                <strong>Color Tone:</strong> {selectedProduct.color}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-brand uppercase tracking-wider text-champagne font-bold text-[10px]">
                  Select Size
                </span>
                <button className="text-[10px] text-champagne/70 hover:text-champagne flex items-center gap-1 underline">
                  <Ruler className="w-3 h-3" />
                  <span>Size Chart</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                      selectedSize === sz
                        ? 'bg-champagne text-plum font-bold shadow-gold-subtle'
                        : 'bg-plum/70 text-ivory/80 border border-champagne/20 hover:border-champagne/60'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Required Action Buttons */}
            {/* Specification: ADD TO CART, BUY NOW, AI VIRTUAL TRY-ON, ADD TO WISHLIST */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addToCart(selectedProduct, selectedSize)}
                  className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/40 font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-gold-subtle hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleVirtualTryOn}
                  className="bg-plum hover:bg-burgundy text-champagne border border-champagne/30 font-semibold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-champagne" />
                  <span>AI VIRTUAL TRY-ON</span>
                </button>

                <button
                  onClick={() => toggleWishlist(selectedProduct)}
                  className={`border font-semibold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    wishlisted
                      ? 'bg-rose text-white border-rose'
                      : 'bg-plum hover:bg-burgundy text-ivory/80 border-champagne/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                  <span>{wishlisted ? 'WISHLISTED' : 'ADD TO WISHLIST'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
