import React from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, setSelectedProduct, products } = useApp();

  if (!isSearchOpen) return null;

  const results = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.event && p.event.toLowerCase().includes(q)) ||
          p.occasion.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          (p.style && p.style.toLowerCase().includes(q)) ||
          (p.dressType && p.dressType.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
    : products.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/80 backdrop-blur-md"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative bg-plum-dark border border-champagne/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl z-10 text-ivory space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-champagne/20">
          <div className="flex items-center gap-2 text-champagne text-xs font-brand uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>Search StyleMira AI Catalog</span>
          </div>
          <button onClick={() => setIsSearchOpen(false)}>
            <X className="w-5 h-5 text-ivory/70 hover:text-champagne" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bridal lehenga, velvet peshwas, barat, nikah, plum..."
            className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-3 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-champagne"
          />
        </div>

        {/* Quick Results */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 block">
            {searchQuery.trim() ? `Search Results (${results.length})` : 'Popular Suggestions'}
          </span>

          <div className="space-y-2">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setIsSearchOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-plum/60 hover:bg-burgundy/80 border border-champagne/15 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images.front}
                    alt={product.name}
                    className="w-12 h-14 object-cover rounded"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-ivory">{product.name}</h4>
                    <span className="text-[10px] text-champagne">
                      {product.category} • {product.occasion}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-editorial text-champagne block">
                    PKR {product.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-ivory/50 flex items-center gap-1 justify-end">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
