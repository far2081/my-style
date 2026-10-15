import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getMatchingBridalSuite, getBridalThemeKey, BRIDAL_THEME_SETS } from '../../data/bridalLooks';
import { Sparkles, Check, Crown, Diamond, Heart, ShoppingBag, ArrowRight, Palette, Shirt, RefreshCw, Camera, Upload, RotateCw, X, Eye } from 'lucide-react';
import { BridalItem, Product } from '../../types';
import { CameraModal } from '../common/CameraModal';

export const BridalStudioSection: React.FC = () => {
  const {
    products,
    selectedBridalItems,
    setSelectedBridalItems,
    toggleBridalItem,
    bridalLookTotal,
    isBridalOfferEligible,
    addToCart,
    tryOnProduct,
    setTryOnProduct,
    setSelectedProduct,
    customerPhoto,
    setCustomerPhoto,
    personalizedTryOnUrl,
    personalizedTryOnProductId,
    isTryOnGenerating,
    tryOnError,
    generateTryOnForProduct,
    setActiveView,
  } = useApp();

  // 1. Filter genuine bridal dresses from real catalog (Barat, Nikah, Valima, Bridal)
  const bridalDresses = useMemo(() => {
    const list = products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const occ = (p.occasion || '').toLowerCase();
      const evt = (p.event || '').toLowerCase();
      return (
        cat.includes('bridal') ||
        occ.includes('barat') ||
        occ.includes('nikah') ||
        occ.includes('valima') ||
        evt.includes('barat') ||
        evt.includes('nikah') ||
        evt.includes('valima')
      );
    });
    return list.length > 0 ? list : products.slice(0, 15);
  }, [products]);

  // 2. Active Dress selection - Synchronized with tryOnProduct if already chosen
  const [selectedDress, setSelectedDress] = useState<Product>(() => {
    if (tryOnProduct && bridalDresses.some((d) => d.id === tryOnProduct.id)) {
      return tryOnProduct;
    }
    return bridalDresses[0] || products[0];
  });
  const [activeTab, setActiveTab] = useState<string>('Bridal Dress');
  const [isSavedLook, setIsSavedLook] = useState(false);
  const [addedToCartNotification, setAddedToCartNotification] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'catalog' | 'tryon'>('tryon');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if tryOnProduct changes from another section
  useEffect(() => {
    if (tryOnProduct && bridalDresses.some((d) => d.id === tryOnProduct.id) && selectedDress.id !== tryOnProduct.id) {
      setSelectedDress(tryOnProduct);
    }
  }, [tryOnProduct, bridalDresses]);

  // Sync previewMode to 'tryon' if a try-on exists for this dress
  useEffect(() => {
    if (personalizedTryOnUrl && personalizedTryOnProductId === selectedDress.id) {
      setPreviewMode('tryon');
    }
  }, [personalizedTryOnUrl, personalizedTryOnProductId, selectedDress.id]);

  const categories = ['Bridal Dress', 'Makeup', 'Jewelry', 'Hair', 'Dupatta', 'Shoes', 'Accessories'] as const;

  // 3. Dynamically compute the harmonized 7-piece suite tailored to the selected dress
  const harmonizedSuite = useMemo(() => {
    return getMatchingBridalSuite(selectedDress);
  }, [selectedDress]);

  const activeThemeKey = getBridalThemeKey(selectedDress.color, selectedDress.occasion || selectedDress.event);
  const activeTheme = BRIDAL_THEME_SETS[activeThemeKey] || BRIDAL_THEME_SETS['maroon-red'];

  // Keep AppContext selectedBridalItems synchronized with the newly selected dress and its matching suite
  useEffect(() => {
    if (harmonizedSuite && harmonizedSuite.length > 0) {
      setSelectedBridalItems(harmonizedSuite);
    }
  }, [selectedDress]);

  // Current item being inspected on the spotlight stage
  const currentCategoryItem: BridalItem = useMemo(() => {
    if (activeTab === 'Bridal Dress') {
      return {
        category: 'Bridal Dress',
        name: selectedDress.name,
        description: selectedDress.description || `${selectedDress.fabric} bridal ensemble tailored for ${selectedDress.occasion || 'Barat'} celebrations.`,
        image: selectedDress.images.front,
        price: selectedDress.price,
      };
    }
    const found = harmonizedSuite.find((item) => item.category === activeTab);
    return found || harmonizedSuite[0];
  }, [activeTab, selectedDress, harmonizedSuite]);

  // Change selected dress and keep global tryOnProduct synchronized
  const handleSelectDress = (dress: Product) => {
    setSelectedDress(dress);
    setTryOnProduct(dress);
    setSelectedProduct(dress);
    setIsSavedLook(false);
    setAddedToCartNotification(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCustomerPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateBridalTryOn = async () => {
    if (!selectedDress) return;
    setTryOnProduct(selectedDress);
    const success = await generateTryOnForProduct(selectedDress);
    if (success) {
      setPreviewMode('tryon');
    }
  };

  // Add the entire bridal ensemble (dress + accessories) to cart
  const handleAddEnsembleToCart = () => {
    // Add the dress
    addToCart(selectedDress, 'M');
    setAddedToCartNotification(true);
    setTimeout(() => setAddedToCartNotification(false), 4500);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-plum-dark via-burgundy-deep to-plum text-ivory relative overflow-hidden" id="bridal-studio">
      {/* Decorative Champagne Gold Filigree Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-champagne/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-plum/50 rounded-full blur-3xl pointer-events-none" />

      {/* Bridal Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photo) => setCustomerPhoto(photo)}
        title="Bridal Atelier Portrait Scanner"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy text-champagne border border-champagne/40 text-[10px] font-brand uppercase tracking-[0.3em] mb-4 shadow-gold-subtle">
            <Crown className="w-3.5 h-3.5 text-champagne" />
            <span>The Royal Atelier Suite</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            YOUR COMPLETE BRIDAL LOOK
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-4" />
          <p className="text-sm sm:text-base text-ivory/80 max-w-2xl mx-auto leading-relaxed font-light">
            Every bridal element harmonized under one imperial vision. Select any bridal dress and all matching jewelry, makeup, hair styling, veil, khussa, and potli automatically recalibrate to match your exact dress palette.
          </p>
        </div>

        {/* Bride's Atelier Portrait & AI Try-On Integration Card */}
        <div className="mb-10 bg-plum-dark/95 border border-champagne/35 rounded-2xl p-5 sm:p-6 shadow-luxury">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {customerPhoto ? (
                <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-champagne shadow-gold-subtle bg-charcoal shrink-0">
                  <img src={customerPhoto} alt="Bride's Portrait" className="w-full h-full object-contain" />
                  <div className="absolute inset-x-0 bottom-0 bg-plum-dark/95 text-[8px] font-brand uppercase text-champagne font-bold text-center py-0.5">
                    Bride
                  </div>
                </div>
              ) : (
                <div className="w-16 h-20 rounded-xl border border-dashed border-champagne/40 bg-plum/40 flex flex-col items-center justify-center text-champagne/60 shrink-0">
                  <Camera className="w-6 h-6 mb-1 text-champagne/70" />
                  <span className="text-[8px] uppercase tracking-wider font-brand text-ivory/60">No Photo</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-brand uppercase tracking-wider text-champagne font-bold">
                    00. Bride's Portrait & Atelier Try-On
                  </span>
                  {customerPhoto ? (
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Portrait Connected ✓</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-ivory/60 bg-plum/50 border border-champagne/20 px-2 py-0.5 rounded-full">
                      Step 0: Add Portrait
                    </span>
                  )}
                </div>
                <h4 className="text-base sm:text-lg font-editorial font-bold text-ivory mt-0.5">
                  {customerPhoto ? 'Your Bridal Portrait is Ready' : 'Add Your Photo for Bespoke Atelier Fitting'}
                </h4>
                <p className="text-xs text-ivory/70 font-light mt-0.5 max-w-xl">
                  {customerPhoto
                    ? `Your portrait is connected across StyleMira. Try on ${selectedDress.name} instantly to see yourself wearing this couture bridal ensemble.`
                    : 'Capture with your webcam or upload a portrait to preview yourself in this handcrafted Pakistani bridal dress.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {customerPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateBridalTryOn}
                    disabled={isTryOnGenerating}
                    className="flex-1 md:flex-initial bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-gold-subtle hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-plum" />
                    <span>
                      {isTryOnGenerating
                        ? 'Draping On You...'
                        : personalizedTryOnUrl && personalizedTryOnProductId === selectedDress.id
                        ? 'Regenerate Atelier Try-On'
                        : '✨ Try On This Bridal Ensemble'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="bg-plum-dark hover:bg-burgundy text-champagne border border-champagne/30 text-xs px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Retake camera photo"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-plum-dark hover:bg-burgundy text-champagne border border-champagne/30 text-xs px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Upload different photo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerPhoto(null)}
                    className="text-rose text-xs hover:underline px-2 py-2.5"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 md:flex-initial bg-champagne text-plum font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-gold-subtle hover:scale-105 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4 text-plum" />
                    <span>Start Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 md:flex-initial bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/40 text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {tryOnError && (
            <div className="mt-3 text-xs text-rose-light bg-rose/20 border border-rose/30 rounded-xl p-2.5">
              {tryOnError}
            </div>
          )}
        </div>

        {/* Dynamic Color Palette & Harmonization Banner */}
        <div className="mb-10 bg-plum-dark/80 border border-champagne/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-luxury">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy border border-champagne/40 flex items-center justify-center shrink-0 shadow-sm">
              <Palette className="w-5 h-5 text-champagne" />
            </div>
            <div>
              <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block">
                Harmonized Theme: {activeTheme.themeName}
              </span>
              <p className="text-xs text-ivory/80 font-light mt-0.5">
                {activeTheme.paletteDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-brand uppercase text-ivory/60">Selected Dress:</span>
            <span className="px-3 py-1 rounded-full bg-champagne text-plum font-bold text-xs">
              {selectedDress.name} ({selectedDress.color})
            </span>
          </div>
        </div>

        {/* 1. BRIDAL DRESS SELECTOR CAROUSEL / GRID */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-champagne" />
              <h3 className="text-sm font-brand uppercase tracking-widest text-champagne font-bold">
                Step 1: Choose Your Bridal Dress ({bridalDresses.length} Haute Couture Ensembles)
              </h3>
            </div>
            <span className="text-xs text-ivory/60 hidden sm:inline">
              Click any dress to recalibrate all matching accessories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-1 no-scrollbar rounded-2xl bg-plum-dark/50 border border-champagne/20">
            {bridalDresses.map((dress) => {
              const isCurrent = dress.id === selectedDress.id;
              return (
                <div
                  key={dress.id}
                  onClick={() => handleSelectDress(dress)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isCurrent
                      ? 'border-champagne ring-2 ring-champagne bg-burgundy/90 shadow-gold-glow scale-102'
                      : 'border-champagne/20 bg-plum-dark/80 hover:border-champagne/60 hover:scale-101'
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                    <img
                      src={dress.images.front}
                      alt={dress.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/categories/Barat/dress_02.jpeg';
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5 bg-burgundy/85 backdrop-blur-sm border border-champagne/30 px-1.5 py-0.5 rounded text-[8px] font-brand uppercase tracking-wider text-champagne">
                      {dress.occasion || dress.event || 'Bridal'}
                    </div>
                    {isCurrent && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-champagne text-plum flex items-center justify-center font-bold text-[10px] shadow-sm">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[11px] font-semibold text-ivory truncate">{dress.name}</h4>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-ivory/60 truncate">{dress.color} • {dress.fabric}</span>
                      <span className="font-editorial font-bold text-champagne shrink-0">
                        {(dress.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CATEGORY TABS (Step 2: Inspect & Customize Coordinated Elements) */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-brand uppercase tracking-widest text-champagne font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-champagne" />
            <span>Step 2: Inspect Coordinated Suite Elements</span>
          </h3>
          <span className="text-xs text-ivory/60">Active: {activeTab}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((cat) => {
            const isSelected = selectedBridalItems.some((i) => i.category === cat);
            const isActiveTab = activeTab === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-brand uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActiveTab
                    ? 'bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum font-bold shadow-gold-glow scale-105'
                    : isSelected
                    ? 'bg-burgundy text-champagne border border-champagne/40'
                    : 'bg-plum-dark/60 text-ivory/70 hover:text-champagne border border-champagne/15 hover:bg-plum/60'
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-champagne text-plum text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. FEATURED BRIDAL LOOK STAGE */}
        <div className="bg-plum-dark/90 border border-champagne/30 rounded-3xl p-6 sm:p-10 shadow-luxury mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Bridal Portrait Display */}
            <div className="lg:col-span-6 relative aspect-[3/4] rounded-2xl overflow-hidden border border-champagne/40 shadow-2xl bg-charcoal">
              {activeTab === 'Bridal Dress' && personalizedTryOnUrl && personalizedTryOnProductId === selectedDress.id && previewMode === 'tryon' ? (
                <img
                  src={personalizedTryOnUrl}
                  alt={`Personalized Bridal Try-On - ${selectedDress.name}`}
                  className="w-full h-full object-contain bg-charcoal transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <img
                  src={currentCategoryItem.image}
                  alt={currentCategoryItem.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal/dupatta-crimson.jpg';
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/85 via-transparent to-transparent pointer-events-none" />

              {/* Category / Try-On Badge */}
              <div className="absolute top-4 left-4 bg-burgundy/85 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-lg text-[10px] font-brand tracking-widest uppercase text-champagne z-10 shadow">
                {activeTab === 'Bridal Dress' && personalizedTryOnUrl && personalizedTryOnProductId === selectedDress.id && previewMode === 'tryon' ? (
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Personalized Bridal Try-On</span>
                  </span>
                ) : (
                  <span>{currentCategoryItem.category}</span>
                )}
              </div>

              {/* View Toggle if Try-On is available */}
              {activeTab === 'Bridal Dress' && personalizedTryOnUrl && personalizedTryOnProductId === selectedDress.id && (
                <div className="absolute top-4 right-4 z-10 flex gap-1 bg-plum-dark/95 backdrop-blur-md p-1 rounded-xl border border-champagne/40 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('tryon')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                      previewMode === 'tryon'
                        ? 'bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum shadow-gold-subtle'
                        : 'text-ivory/70 hover:text-champagne'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>On You</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('catalog')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      previewMode === 'catalog'
                        ? 'bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum shadow-gold-subtle'
                        : 'text-ivory/70 hover:text-champagne'
                    }`}
                  >
                    Catalog
                  </button>
                </div>
              )}

              {/* Generating Try-On Overlay */}
              {isTryOnGenerating && activeTab === 'Bridal Dress' && (
                <div className="absolute inset-0 bg-plum-dark/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20 text-center">
                  <RefreshCw className="w-8 h-8 text-champagne animate-spin mb-3" />
                  <p className="text-xs font-bold text-champagne uppercase tracking-widest">
                    Generating Bridal AI Try-On...
                  </p>
                  <p className="text-[11px] text-ivory/70 mt-1">
                    Draping {selectedDress.name} onto your bridal portrait
                  </p>
                </div>
              )}

              {/* Preserved Corner Customer Photo Inset Badge */}
              {customerPhoto && activeTab === 'Bridal Dress' && (
                <div className="absolute bottom-4 right-4 w-16 h-20 rounded-xl overflow-hidden border-2 border-champagne shadow-2xl bg-charcoal flex flex-col items-center justify-center p-0.5 z-10">
                  <img src={customerPhoto} alt="Bride's Portrait" className="w-full h-full object-contain" />
                  <div className="absolute inset-x-0 bottom-0 bg-plum-dark/95 text-center py-0.5 text-[8px] font-brand uppercase text-champagne font-bold">
                    Bride
                  </div>
                </div>
              )}

              <div className="absolute bottom-6 left-6 right-24 pointer-events-none">
                <span className="text-xs uppercase tracking-widest text-champagne font-brand block mb-1">
                  Atelier Curation • {activeTheme.themeName}
                </span>
                <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-ivory mb-2">
                  {currentCategoryItem.name}
                </h3>
                <span className="text-xl font-editorial font-bold text-champagne">
                  PKR {currentCategoryItem.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right Curation Details & Builder Breakdown */}
            <div className="lg:col-span-6 space-y-7">
              <div>
                <span className="text-xs font-brand tracking-[0.25em] uppercase text-champagne block mb-2">
                  Harmonized Element • {currentCategoryItem.category}
                </span>
                <h4 className="text-2xl sm:text-4xl font-editorial font-bold text-ivory mb-3">
                  {currentCategoryItem.name}
                </h4>
                <p className="text-sm text-ivory/80 leading-relaxed font-light mb-6">
                  {currentCategoryItem.description}
                </p>

                <button
                  onClick={() => toggleBridalItem(currentCategoryItem)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-brand uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    selectedBridalItems.some((i) => i.name === currentCategoryItem.name)
                      ? 'bg-burgundy text-champagne border border-champagne/50 shadow-gold-subtle'
                      : 'bg-champagne hover:bg-champagne-light text-plum font-bold shadow-md'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {selectedBridalItems.some((i) => i.name === currentCategoryItem.name)
                      ? 'Included in Bridal Ensemble ✓'
                      : 'Add This Element to My Look'}
                  </span>
                </button>
              </div>

              {/* Current Ensemble Breakdown */}
              <div className="bg-charcoal/80 border border-champagne/25 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-champagne/15">
                  <span className="text-xs font-brand uppercase tracking-wider text-champagne font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Selected Bridal Suite ({selectedBridalItems.length}/7 Elements)</span>
                  </span>
                  <span className="text-xs text-ivory/60">
                    Bespoke Consultation Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const item = selectedBridalItems.find((i) => i.category === cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                          item
                            ? 'bg-plum border-champagne/40 text-ivory'
                            : 'bg-plum-dark/40 border-champagne/10 text-ivory/40 hover:border-champagne/30'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider text-champagne-light block">
                          {cat}
                        </span>
                        <p className="text-[11px] font-medium truncate">
                          {item ? item.name : '+ Select item'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Ensemble Total Price */}
                <div className="pt-3 border-t border-champagne/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-ivory/50 block">Complete Look Investment</span>
                    <span className="text-2xl font-editorial font-bold text-champagne">
                      PKR {bridalLookTotal.toLocaleString()}
                    </span>
                  </div>

                  {isBridalOfferEligible && (
                    <div className="bg-plum px-3 py-1.5 rounded-lg border border-champagne/30 text-right">
                      <span className="text-[9px] font-brand uppercase text-champagne font-bold block">
                        VIP Promotion Unlocked
                      </span>
                      <span className="text-[10px] text-ivory/80">
                        Complimentary HD Bridal Makeup Included ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddEnsembleToCart}
                  className="flex-1 bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.25em] py-4 rounded-xl shadow-gold-glow hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-plum" />
                  <span>ADD COMPLETE SUITE TO CART</span>
                </button>

                <button
                  onClick={() => {
                    setTryOnProduct(selectedDress);
                    setSelectedProduct(selectedDress);
                    setActiveView('tryon');
                  }}
                  className="px-6 py-4 rounded-xl bg-plum border border-champagne/40 hover:bg-burgundy text-champagne text-xs font-brand uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-champagne" />
                  <span>OPEN IN 3D RUNWAY & TRY-ON</span>
                </button>
              </div>

              {addedToCartNotification && (
                <div className="bg-burgundy/90 border border-champagne/50 rounded-xl p-4 text-xs text-champagne flex items-center gap-2 shadow-gold-subtle">
                  <Check className="w-4 h-4 text-champagne" />
                  <span>
                    The complete {selectedDress.name} bridal suite has been reserved and added to your atelier cart!
                  </span>
                </div>
              )}

              {isSavedLook && (
                <div className="bg-burgundy/80 border border-champagne/40 rounded-xl p-4 text-xs text-champagne flex items-center gap-2">
                  <Check className="w-4 h-4 text-champagne" />
                  <span>
                    Your complete bridal suite has been logged in your client portal. A Senior Bridal Stylist will contact you for measurement verification.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
