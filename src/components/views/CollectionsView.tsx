import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Filter, SlidersHorizontal, X, Heart, Eye, ShoppingBag, Sparkles, Check, Search, ArrowLeft } from 'lucide-react';
import { STANDARDIZED_COLORS, STANDARDIZED_FABRICS, EVENT_SUBCATEGORIES } from '../../data/constants';

export const CollectionsView: React.FC = () => {
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
    setTryOnProduct,
    setIsTryOnModalOpen,
    activeFilterOccasion,
    setActiveFilterOccasion,
    activeFilterEvent,
    setActiveFilterEvent,
    selectedCollection,
    setSelectedCollection,
    setActiveView,
  } = useApp();

  // Filter States per Section 28
  // Event, Category, Subcategory, Color, Fabric, Season, Price, Size, Style, Availability, Trending, New Arrival, Featured
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [filterNewOnly, setFilterNewOnly] = useState<boolean>(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState<boolean>(false);
  const [filterTrendingOnly, setFilterTrendingOnly] = useState<boolean>(false);
  const [filterExclusiveOnly, setFilterExclusiveOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(400000);
  const [sortBy, setSortBy] = useState<string>('ai-recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const categories = [
    'All',
    'Barat',
    'Nikah',
    'Valima',
    'Party',
    'Casual',
    'Winter',
    'Summer',
    'Bridal',
    'Formal',
    'Luxury Pret',
    'Festive'
  ];
  const seasons = ['All', 'Summer', 'Winter', 'Spring', 'All Season'];
  const availabilities = ['All', 'In Stock', 'Bespoke / Made to Order', 'Limited Edition'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be published
      if (p.status !== 'published') return false;

      // Search keyword
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesEvent = (p.event || '').toLowerCase().includes(query);
        const matchesFabric = p.fabric.toLowerCase().includes(query);
        const matchesColor = p.color.toLowerCase().includes(query);
        const matchesTags = p.tags && p.tags.some((t) => t.toLowerCase().includes(query));
        const matchesDressType = (p.dressType || '').toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesEvent && !matchesFabric && !matchesColor && !matchesTags && !matchesDressType) {
          return false;
        }
      }

      // Event / Collection filter
      if (activeFilterEvent && p.event && p.event.toUpperCase() !== activeFilterEvent.toUpperCase()) {
        return false;
      }
      if (activeFilterOccasion && !p.occasion.toLowerCase().includes(activeFilterOccasion.toLowerCase())) {
        return false;
      }

      // Category / Occasion / Season matching
      if (selectedCategory !== 'All') {
        const catL = selectedCategory.toLowerCase().replace(/[\s-]/g, '');
        const pCatL = (p.category || '').toLowerCase().replace(/[\s-]/g, '');
        const pOccL = (p.occasion || '').toLowerCase().replace(/[\s-]/g, '');
        const pEvtL = (p.event || '').toLowerCase().replace(/[\s-]/g, '');
        const pSeaL = (p.season || '').toLowerCase().replace(/[\s-]/g, '');
        const isValimaWalima =
          (catL === 'valima' || catL === 'walima') &&
          (pOccL.includes('valima') || pOccL.includes('walima') || pEvtL.includes('valima') || pEvtL.includes('walima'));

        const isMatch =
          isValimaWalima ||
          pCatL.includes(catL) ||
          pOccL.includes(catL) ||
          pEvtL.includes(catL) ||
          pSeaL.includes(catL);

        if (!isMatch) return false;
      }

      // Fabric
      if (selectedFabric !== 'All' && p.fabric !== selectedFabric) return false;

      // Color
      if (selectedColor !== 'All' && p.color !== selectedColor && !(p.secondaryColors && p.secondaryColors.includes(selectedColor))) return false;

      // Season
      if (selectedSeason !== 'All' && p.season !== selectedSeason) return false;

      // Availability
      if (selectedAvailability !== 'All' && p.availability !== selectedAvailability) return false;

      // Flags
      if (filterNewOnly && !p.newArrival) return false;
      if (filterFeaturedOnly && !p.featured) return false;
      if (filterTrendingOnly && !p.trending) return false;
      if (filterExclusiveOnly && !p.exclusive) return false;

      // Price
      if (p.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
      // ai-recommended default
      return b.rating - a.rating;
    });
  }, [
    products,
    searchFilter,
    activeFilterEvent,
    activeFilterOccasion,
    selectedCategory,
    selectedFabric,
    selectedColor,
    selectedSeason,
    selectedAvailability,
    filterNewOnly,
    filterFeaturedOnly,
    filterTrendingOnly,
    filterExclusiveOnly,
    maxPrice,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchFilter('');
    setSelectedCategory('All');
    setSelectedFabric('All');
    setSelectedColor('All');
    setSelectedSeason('All');
    setSelectedAvailability('All');
    setFilterNewOnly(false);
    setFilterFeaturedOnly(false);
    setFilterTrendingOnly(false);
    setFilterExclusiveOnly(false);
    setActiveFilterOccasion(null);
    setActiveFilterEvent(null);
    setSelectedCollection(null);
    setMaxPrice(400000);
  };

  return (
    <div className="py-12 bg-plum text-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Title & Breadcrumbs with Back Button */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-brand uppercase tracking-[0.25em] text-champagne mb-2">
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    setActiveView('home');
                  }
                }}
                className="hover:underline flex items-center gap-1 text-champagne"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              <span>•</span>
              <span>StyleMira AI Atelier</span>
              <span>•</span>
              <span>Haute Couture Catalog</span>
              {activeFilterEvent && (
                <>
                  <span>•</span>
                  <span className="text-champagne-light font-bold">{activeFilterEvent} COLLECTION</span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-editorial font-bold text-ivory tracking-tight uppercase">
              {activeFilterEvent ? `${activeFilterEvent} COLLECTION` : 'COUTURE COLLECTIONS'}
            </h1>
            <p className="text-xs sm:text-sm text-ivory/70 max-w-xl mt-2 font-light">
              {selectedCollection?.description ||
                'Explore our curated Pakistani bridal lehengas, festive peshwas, and luxury velvet Pret ensembles.'}
            </p>
          </div>

          <button
            onClick={() => setActiveView('home')}
            className="self-center sm:self-start px-4 py-2 rounded-xl bg-plum-dark border border-champagne/30 text-champagne hover:bg-burgundy text-xs font-brand uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Top Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between pb-6 mb-8 border-b border-champagne/20 gap-4">
          {/* Search Input for Catalog */}
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search dress, fabric, zardozi, velvet..."
              className="w-full bg-plum-dark border border-champagne/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-champagne"
            />
            <Search className="w-4 h-4 text-champagne absolute left-3.5 top-3" />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-2.5 text-ivory/50 hover:text-champagne text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-burgundy border border-champagne/40 px-4 py-2.5 rounded-xl text-xs font-brand uppercase tracking-wider text-champagne"
            >
              <Filter className="w-4 h-4" />
              <span>Filters ({filteredProducts.length})</span>
            </button>

            <span className="text-xs text-ivory/60">
              Showing <strong>{filteredProducts.length}</strong> creations
            </span>

            {/* Active Pills */}
            {activeFilterEvent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne text-plum text-[10px] font-brand uppercase font-bold">
                {activeFilterEvent}
                <button onClick={() => { setActiveFilterEvent(null); setSelectedCollection(null); }}>×</button>
              </span>
            )}

            {activeFilterOccasion && !activeFilterEvent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne text-plum text-[10px] font-brand uppercase font-bold">
                Occasion: {activeFilterOccasion}
                <button onClick={() => setActiveFilterOccasion(null)}>×</button>
              </span>
            )}

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-ivory/60 font-brand uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-plum-dark border border-champagne/30 text-champagne text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-champagne cursor-pointer"
              >
                <option value="ai-recommended">AI Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Category Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <span className="text-[11px] font-brand uppercase tracking-wider text-champagne/70 mr-1 hidden sm:inline">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-brand uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-champagne text-plum font-bold border-champagne shadow-gold-subtle'
                  : 'bg-plum-dark/80 text-ivory/70 border-champagne/20 hover:border-champagne/50 hover:text-champagne'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Elegant Sidebar Filters (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 bg-plum-dark/80 border border-champagne/25 rounded-2xl p-6 sticky top-28 space-y-6 shadow-luxury max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-champagne/15">
              <span className="font-brand text-xs uppercase tracking-widest text-champagne font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Catalog Filters</span>
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] text-ivory/50 hover:text-champagne underline"
              >
                Reset All
              </button>
            </div>

            {/* Quick Status Tags */}
            <div>
              <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                Couture Status
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setFilterNewOnly(!filterNewOnly)}
                  className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-colors ${
                    filterNewOnly
                      ? 'bg-champagne text-plum font-bold border-champagne'
                      : 'bg-plum/60 text-ivory/70 border-champagne/15'
                  }`}
                >
                  New Arrivals {filterNewOnly && '✓'}
                </button>
                <button
                  onClick={() => setFilterFeaturedOnly(!filterFeaturedOnly)}
                  className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-colors ${
                    filterFeaturedOnly
                      ? 'bg-champagne text-plum font-bold border-champagne'
                      : 'bg-plum/60 text-ivory/70 border-champagne/15'
                  }`}
                >
                  Featured {filterFeaturedOnly && '✓'}
                </button>
                <button
                  onClick={() => setFilterTrendingOnly(!filterTrendingOnly)}
                  className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-colors ${
                    filterTrendingOnly
                      ? 'bg-champagne text-plum font-bold border-champagne'
                      : 'bg-plum/60 text-ivory/70 border-champagne/15'
                  }`}
                >
                  Trending {filterTrendingOnly && '✓'}
                </button>
                <button
                  onClick={() => setFilterExclusiveOnly(!filterExclusiveOnly)}
                  className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-colors ${
                    filterExclusiveOnly
                      ? 'bg-champagne text-plum font-bold border-champagne'
                      : 'bg-plum/60 text-ivory/70 border-champagne/15'
                  }`}
                >
                  Exclusive {filterExclusiveOnly && '✓'}
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="pt-4 border-t border-champagne/15">
              <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                Category
              </label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedCategory === cat
                        ? 'bg-burgundy text-champagne font-bold'
                        : 'text-ivory/70 hover:bg-plum/50 hover:text-ivory'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-champagne" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric Filter (Section 23 Standardized Fabrics) */}
            <div className="pt-4 border-t border-champagne/15">
              <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                Fabric Material
              </label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
              >
                <option value="All">All Fabrics</option>
                {STANDARDIZED_FABRICS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Color Filter (Section 22 Standardized Colors) */}
            <div className="pt-4 border-t border-champagne/15">
              <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                Color Palette
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
              >
                <option value="All">All Colors</option>
                {STANDARDIZED_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Season Filter */}
            <div className="pt-4 border-t border-champagne/15">
              <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                Season
              </label>
              <div className="space-y-1">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedSeason === s
                        ? 'bg-burgundy text-champagne font-bold'
                        : 'text-ivory/70 hover:bg-plum/50 hover:text-ivory'
                    }`}
                  >
                    <span>{s}</span>
                    {selectedSeason === s && <Check className="w-3.5 h-3.5 text-champagne" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="pt-4 border-t border-champagne/15">
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne font-bold">
                  Max Investment
                </label>
                <span className="text-champagne font-editorial font-bold">
                  PKR {maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="40000"
                max="400000"
                step="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-champagne cursor-pointer"
              />
            </div>
          </aside>

          {/* Product Grid Area (9 cols) */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-2xl p-12 text-center space-y-4">
                <p className="text-lg font-editorial text-ivory">No pieces match your selected filter criteria.</p>
                <button
                  onClick={resetFilters}
                  className="bg-champagne text-plum font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-gold-subtle"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const wishlisted = isInWishlist(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-plum-dark rounded-xl overflow-hidden border border-champagne/20 hover:border-champagne/70 shadow-lg hover:shadow-luxury transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                        <ImageWithFallback
                          src={product.images.front}
                          alt={product.name}
                          fallbackCategory={product.category}
                          aspectRatio="aspect-[3/4]"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          {product.newArrival && (
                            <span className="px-2 py-0.5 rounded-full bg-champagne text-plum text-[9px] font-brand uppercase font-bold">
                              New
                            </span>
                          )}
                          {product.trending && (
                            <span className="px-2 py-0.5 rounded-full bg-burgundy text-champagne text-[9px] font-brand uppercase font-semibold">
                              Trending
                            </span>
                          )}
                          {product.exclusive && (
                            <span className="px-2 py-0.5 rounded-full bg-plum-dark/90 text-champagne-light border border-champagne/30 text-[9px] font-brand uppercase font-semibold">
                              Exclusive
                            </span>
                          )}
                        </div>

                        {/* Wishlist */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
                            wishlisted
                              ? 'bg-rose text-white'
                              : 'bg-plum-dark/60 text-ivory/80 hover:text-champagne'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                        </button>

                        {/* Hover Quick Action */}
                        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTryOnProduct(product);
                              setIsTryOnModalOpen(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Try-On</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-champagne-light/70 uppercase tracking-wider mb-1">
                            <span>{product.category}</span>
                            <span>{product.event || product.occasion}</span>
                          </div>
                          <h3 className="font-editorial text-lg font-bold text-ivory group-hover:text-champagne transition-colors leading-snug line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="text-[11px] text-ivory/60 mt-1 flex items-center gap-2">
                            <span>{product.fabric}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-champagne/30 inline-block"
                                style={{ backgroundColor: product.colorHex }}
                              />
                              {product.color}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-champagne/15 flex items-center justify-between">
                          <span className="font-editorial text-base font-bold text-champagne">
                            PKR {product.price.toLocaleString()}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="p-2 rounded-lg bg-burgundy hover:bg-champagne hover:text-plum text-champagne border border-champagne/30 transition-colors"
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-h-[85vh] bg-plum-dark border-t border-champagne/30 rounded-t-3xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-champagne/20">
              <span className="font-brand text-xs uppercase tracking-wider text-champagne font-bold">
                Filter Collections ({filteredProducts.length} Results)
              </span>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-ivory/70" />
              </button>
            </div>

            <div>
              <label className="text-xs uppercase text-champagne font-bold block mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold ${
                      selectedCategory === c ? 'bg-champagne text-plum font-bold' : 'bg-plum text-ivory/70'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase text-champagne font-bold block mb-2">Fabric</label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory"
              >
                <option value="All">All Fabrics</option>
                {STANDARDIZED_FABRICS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase text-champagne font-bold block mb-2">Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory"
              >
                <option value="All">All Colors</option>
                {STANDARDIZED_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-champagne text-plum font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-gold-subtle"
            >
              Apply Filters ({filteredProducts.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
