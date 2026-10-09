import React from 'react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, setActiveView, setSelectedProduct } = useApp();

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    toggleWishlist(product);
  };

  return (
    <div className="py-16 bg-plum text-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setActiveView('home');
              }
            }}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-plum-dark border border-champagne/30 text-champagne hover:bg-burgundy flex items-center gap-1.5 text-xs font-brand uppercase tracking-wider transition-all"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-brand uppercase tracking-[0.25em] text-champagne mb-2">
              <Heart className="w-3.5 h-3.5 fill-champagne text-champagne" />
              <span>Private Curations</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-editorial font-bold text-ivory tracking-tight uppercase">
              SAVED WISHLIST ({wishlist.length})
            </h1>
          </div>
          <div className="w-20 hidden sm:block" />
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-plum-dark/60 border border-champagne/20 rounded-2xl p-16 text-center max-w-md mx-auto space-y-4">
            <Heart className="w-12 h-12 text-champagne/30 mx-auto" />
            <h3 className="font-editorial text-xl text-ivory">Your Wishlist is Empty</h3>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Explore our latest Pakistani bridal and pret collections to curate your personal stylebook.
            </p>
            <button
              onClick={() => setActiveView('collections')}
              className="bg-champagne text-plum font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-gold-subtle"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          /* Cards showing: Image, Product, Price, Availability, Move to Cart, Remove */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-plum-dark border border-champagne/25 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                {/* Image */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-charcoal cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <ImageWithFallback
                    src={product.images.front}
                    alt={product.name}
                    fallbackCategory={product.category}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-burgundy/80 text-champagne text-[9px] font-brand uppercase tracking-wider px-2 py-0.5 rounded-full border border-champagne/30">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-editorial text-lg font-bold text-ivory hover:text-champagne transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-champagne-light/70 font-editorial mt-0.5 line-clamp-1">
                      {product.color}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-editorial font-bold text-champagne">
                        PKR {product.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-ivory/60 uppercase">
                        {product.availability}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Move to Cart & Remove */}
                  <div className="mt-5 pt-4 border-t border-champagne/15 flex items-center gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 bg-champagne hover:bg-champagne-light text-plum font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-lg shadow-gold-subtle flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className="p-2.5 rounded-lg text-rose hover:bg-rose/15 transition-colors border border-rose/30"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
