import React from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Heart, Eye, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

export const LatestDresses: React.FC = () => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
    setTryOnProduct,
    setIsTryOnModalOpen,
    setActiveView,
    newArrivals,
  } = useApp();

  const handleTryOn = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setTryOnProduct(product);
    setIsTryOnModalOpen(true);
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <section className="py-24 bg-plum text-ivory relative overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-burgundy/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-mauve/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-3">
              <Sparkles className="w-3 h-3 text-champagne" />
              <span>Autumn/Winter 2026 Capsule</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase">
              LATEST DRESSES
            </h2>
            <p className="text-sm sm:text-base text-ivory/70 max-w-lg mt-2 font-light">
              Discover the newest styles curated for you. Master-crafted embroideries, pure silken weaves, and precision-fitted silhouettes.
            </p>
          </div>

          <button
            onClick={() => setActiveView('collections')}
            className="self-start md:self-end text-xs uppercase tracking-[0.2em] font-semibold text-champagne hover:text-champagne-light flex items-center gap-2 pb-1 border-b border-champagne/40 hover:border-champagne transition-all"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {(newArrivals.length > 0 ? newArrivals : PRODUCTS_DATA).slice(0, 4).map((product) => {
            const wishlisted = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                onClick={() => handleQuickView(product)}
                className="group relative bg-plum-dark rounded-xl overflow-hidden border border-champagne/20 hover:border-champagne/70 shadow-lg hover:shadow-luxury transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Container with Consistent 3:4 Ratio */}
                <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                  <ImageWithFallback
                    src={product.images.front}
                    alt={product.name}
                    fallbackCategory={product.category}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {product.isNew && (
                      <span className="px-2.5 py-0.5 rounded-full bg-champagne text-plum text-[9px] font-brand uppercase tracking-wider font-bold shadow-sm">
                        New
                      </span>
                    )}
                    {product.isTrending && (
                      <span className="px-2.5 py-0.5 rounded-full bg-burgundy/90 text-champagne-light border border-champagne/30 text-[9px] font-brand uppercase tracking-wider font-semibold backdrop-blur-sm">
                        Trending
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
                      wishlisted
                        ? 'bg-rose text-white shadow-md'
                        : 'bg-plum-dark/60 text-ivory/80 hover:text-champagne hover:bg-plum-dark'
                    }`}
                    title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>

                  {/* Hover Floating Actions: Quick View & AI Try-On */}
                  <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickView(product);
                      }}
                      className="flex-1 bg-plum-dark/90 hover:bg-burgundy text-ivory text-[10px] uppercase tracking-wider font-semibold py-2 px-3 rounded-lg border border-champagne/30 backdrop-blur-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-champagne" />
                      <span>Quick View</span>
                    </button>

                    <button
                      onClick={(e) => handleTryOn(e, product)}
                      className="flex-1 bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum text-[10px] uppercase tracking-wider font-bold py-2 px-3 rounded-lg shadow-gold-subtle transition-transform hover:scale-102 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-plum" />
                      <span>AI Try-On</span>
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-champagne-light/75 mb-1">
                      <span className="uppercase tracking-wider">{product.category}</span>
                      <span>{product.occasion}</span>
                    </div>

                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-ivory group-hover:text-champagne transition-colors leading-snug">
                      {product.name}
                    </h3>

                    {/* Color Swatch & Name */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-champagne/40"
                        style={{ backgroundColor: product.colorHex }}
                      />
                      <span className="text-xs text-ivory/60 truncate">{product.color}</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="mt-5 pt-3 border-t border-champagne/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-ivory/50 uppercase block">Investment</span>
                      <span className="text-base font-bold text-champagne font-editorial">
                        PKR {product.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="p-2.5 rounded-lg bg-burgundy hover:bg-champagne hover:text-plum text-champagne border border-champagne/30 transition-all duration-300 shadow-sm"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
