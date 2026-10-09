import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { CameraModal } from '../common/CameraModal';
import { Sparkles, RotateCw, Check, Info, ChevronLeft, ChevronRight, MoveHorizontal, Camera, Upload, X } from 'lucide-react';
import { Product } from '../../types';
import { aiProviders } from '../../services/aiProvider';

type GarmentViewAngle = 'front' | 'left' | 'right' | 'back';

export const VirtualTryOnSection: React.FC = () => {
  const {
    tryOnProduct,
    setTryOnProduct,
    addToCart,
    products,
    customerPhoto,
    setCustomerPhoto,
    personalizedTryOnUrl,
    setPersonalizedTryOnUrl,
    setPersonalizedTryOnProductId,
  } = useApp();

  const currentDress = tryOnProduct || products[0] || PRODUCTS_DATA[0];

  const [activeView, setActiveView] = useState<GarmentViewAngle>('front');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnGenerated, setTryOnGenerated] = useState(false);
  const [renderedResultUrl, setRenderedResultUrl] = useState<string | null>(personalizedTryOnUrl || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Available sample models
  const sampleModels = [
    { id: 'm1', name: 'Zoya (Warm Ivory)', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80' },
    { id: 'm2', name: 'Ayla (Deep Wheatish)', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80' },
    { id: 'm3', name: 'Mahnoor (Porcelain)', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80' },
  ];

  const [selectedSample, setSelectedSample] = useState(sampleModels[0].img);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomerPhoto(reader.result);
          setSelectedSample('');
          setRenderedResultUrl(null);
          setPersonalizedTryOnUrl(null);
          setPersonalizedTryOnProductId(null);
          setTryOnGenerated(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl: string) => {
    setCustomerPhoto(photoDataUrl);
    setSelectedSample('');
    setRenderedResultUrl(null);
    setPersonalizedTryOnUrl(null);
    setPersonalizedTryOnProductId(null);
    setTryOnGenerated(false);
  };

  const handleClearPhoto = () => {
    setCustomerPhoto(null);
    setSelectedSample(sampleModels[0].img);
    setRenderedResultUrl(null);
    setPersonalizedTryOnUrl(null);
    setPersonalizedTryOnProductId(null);
    setTryOnGenerated(false);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Available genuine views for the catalog dress (distinct authentic photos)
  const genuineViews = useMemo(() => {
    const list: Array<{ id: GarmentViewAngle; label: string; url: string }> = [
      { id: 'front', label: 'Front View', url: currentDress.images.front },
    ];
    if (currentDress.images.left && currentDress.images.left !== currentDress.images.front) {
      list.push({ id: 'left', label: 'Left Profile', url: currentDress.images.left });
    }
    if (currentDress.images.right && currentDress.images.right !== currentDress.images.front) {
      list.push({ id: 'right', label: 'Right Profile', url: currentDress.images.right });
    }
    if (currentDress.images.back && currentDress.images.back !== currentDress.images.front) {
      list.push({ id: 'back', label: 'Back View', url: currentDress.images.back });
    }
    return list;
  }, [currentDress]);

  // Preload genuine garment angles for smooth switching
  useEffect(() => {
    const urlsToPreload = genuineViews.map((v) => v.url);
    urlsToPreload.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [genuineViews]);

  // When dress changes or new result is generated, ensure activeView starts at front
  useEffect(() => {
    setActiveView('front');
  }, [currentDress.id, renderedResultUrl]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTryOnError(null);
    setJobStatus('processing');

    const photoToUse = customerPhoto || selectedSample;
    const res = await aiProviders.tryon.generateTryOn({
      customerPhotoUrl: photoToUse,
      garmentImageUrl: currentDress.images.front,
      productId: currentDress.id,
      perspectiveAngle: 'Front',
    });

    setIsGenerating(false);
    if (res.status === 'failed' || !res.result?.renderedImageUrl) {
      setJobStatus('failed');
      setTryOnError(res.error || 'Virtual Try-On generation failed. Please check provider connection.');
    } else {
      setJobStatus('completed');
      setTryOnGenerated(true);
      setRenderedResultUrl(res.result.renderedImageUrl);
      setPersonalizedTryOnUrl(res.result.renderedImageUrl);
      setPersonalizedTryOnProductId(currentDress.id);
      setActiveView('front');
    }
  };

  const handleResetResult = () => {
    setRenderedResultUrl(null);
    setPersonalizedTryOnUrl(null);
    setPersonalizedTryOnProductId(null);
    setTryOnGenerated(false);
    setJobStatus('idle');
    setActiveView('front');
  };

  // Resolve genuine image for current view
  // NEVER substitute static catalog model images for customer's try-on views
  const getDisplayedImage = () => {
    if (renderedResultUrl) {
      return renderedResultUrl;
    }
    const found = genuineViews.find((v) => v.id === activeView);
    return found ? found.url : currentDress.images.front;
  };

  // View navigation helpers for catalog views
  const currentViewIndex = genuineViews.findIndex((v) => v.id === activeView);

  const handleNextView = () => {
    if (renderedResultUrl || genuineViews.length <= 1) return;
    const nextIndex = (currentViewIndex + 1) % genuineViews.length;
    setActiveView(genuineViews[nextIndex].id);
  };

  const handlePrevView = () => {
    if (renderedResultUrl || genuineViews.length <= 1) return;
    const prevIndex = (currentViewIndex - 1 + genuineViews.length) % genuineViews.length;
    setActiveView(genuineViews[prevIndex].id);
  };

  // Drag / Swipe handlers for genuine views
  const handlePointerDown = (clientX: number) => {
    if (renderedResultUrl || genuineViews.length <= 1) return;
    setIsDragging(true);
    setDragStartX(clientX);
  };

  const handlePointerUp = (clientX: number) => {
    if (!isDragging || renderedResultUrl || genuineViews.length <= 1) return;
    setIsDragging(false);
    const diff = clientX - dragStartX;
    const threshold = 40;
    if (diff < -threshold) {
      handleNextView();
    } else if (diff > threshold) {
      handlePrevView();
    }
  };

  return (
    <section className="py-24 bg-plum text-ivory relative overflow-hidden" id="tryon">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-burgundy/40 rounded-full blur-3xl pointer-events-none" />

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Atelier Portrait Camera"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-4 shadow-gold-subtle">
            <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
            <span>AI Virtual Fitting Room</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            SEE YOURSELF IN THE LOOK
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-ivory/70 max-w-2xl mx-auto leading-relaxed font-light">
            Upload your portrait, select from our heirloom Pakistani couture library, and witness precision photorealistic drape synthesis.
          </p>
        </div>

        {/* Cinematic Try-On Workspace */}
        <div className="bg-plum-dark/95 border border-champagne/30 rounded-2xl p-6 sm:p-8 md:p-10 shadow-luxury">
          {/* Top Formula Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-brand uppercase tracking-wider text-champagne/80 mb-8 pb-6 border-b border-champagne/15 text-center">
            <span className="bg-plum px-3 py-1.5 rounded-lg border border-champagne/20">01. Customer Photo</span>
            <span className="text-champagne font-bold">+</span>
            <span className="bg-plum px-3 py-1.5 rounded-lg border border-champagne/20">02. Selected Couture Dress</span>
            <span className="text-champagne font-bold">=</span>
            <span className="bg-burgundy text-champagne font-bold px-3 py-1.5 rounded-lg border border-champagne/40">
              Virtual Try-On Result
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Customer Photo Selector */}
              <div className="bg-plum/70 border border-champagne/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-brand uppercase tracking-wider text-champagne font-bold">
                    Step 1: Your Photo
                  </span>
                  {customerPhoto && (
                    <button
                      onClick={handleClearPhoto}
                      className="text-[10px] text-rose hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* If Customer Uploaded Photo, show Preview Card */}
                {customerPhoto ? (
                  <div className="relative mb-4 rounded-xl overflow-hidden aspect-[4/3] border border-champagne/40 bg-charcoal">
                    <img
                      src={customerPhoto}
                      alt="Your Uploaded Portrait"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-plum-dark/90 px-2.5 py-0.5 rounded-full border border-champagne/30 text-[9px] font-brand uppercase tracking-wider text-champagne">
                      Your Portrait Active ✓
                    </div>
                    <div className="absolute bottom-2 inset-x-2 flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-plum-dark/90 hover:bg-burgundy text-champagne border border-champagne/30 text-[10px] py-1.5 rounded-lg transition-colors"
                      >
                        Change Photo
                      </button>
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="bg-plum-dark/90 hover:bg-burgundy text-champagne border border-champagne/30 px-3 py-1.5 rounded-lg transition-colors"
                        title="Retake with Camera"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Upload / Camera CTAs */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/30 p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">Upload Photo</span>
                      </button>
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/30 p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">Take Photo</span>
                      </button>
                    </div>

                    {/* Or Choose Calibrated Avatar */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-ivory/60 uppercase tracking-wider block">
                        Or select calibrated atelier avatar:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {sampleModels.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedSample(m.img);
                              setCustomerPhoto(null);
                              setRenderedResultUrl(null);
                              setPersonalizedTryOnUrl(null);
                              setPersonalizedTryOnProductId(null);
                              setTryOnGenerated(false);
                            }}
                            className={`relative rounded-lg overflow-hidden border p-0.5 text-left transition-all ${
                              selectedSample === m.img && !customerPhoto
                                ? 'border-champagne ring-2 ring-champagne/50'
                                : 'border-champagne/20 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={m.img} alt={m.name} className="w-full aspect-square object-cover rounded" />
                            <span className="text-[9px] block text-center truncate py-1 text-ivory/90">
                              {m.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Step 2: Selected Dress Selector */}
              <div className="bg-plum/70 border border-champagne/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-brand uppercase tracking-wider text-champagne font-bold">
                    Step 2: Selected Dress
                  </span>
                  <span className="text-[10px] text-ivory/50">
                    {products.length} in catalog
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {products.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setTryOnProduct(prod);
                        setRenderedResultUrl(null);
                        setPersonalizedTryOnUrl(null);
                        setPersonalizedTryOnProductId(null);
                        setTryOnGenerated(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-all ${
                        currentDress.id === prod.id
                          ? 'bg-burgundy/90 border-champagne text-champagne'
                          : 'bg-plum-dark/40 border-champagne/15 text-ivory/80 hover:bg-plum/60'
                      }`}
                    >
                      <img
                        src={prod.images.front}
                        alt={prod.name}
                        className="w-10 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-ivory">{prod.name}</p>
                        <p className="text-[10px] text-champagne-light">PKR {prod.price.toLocaleString()}</p>
                      </div>
                      {currentDress.id === prod.id && (
                        <Check className="w-4 h-4 text-champagne flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Generate Look CTA */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.25em] py-4 rounded-xl shadow-gold-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-plum" />
                    <span>Draping Fabric Neural Mesh...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-plum" />
                    <span>GENERATE LOOK</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Interactive Try-On Viewer (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {renderedResultUrl ? (
                /* Mode 1: Personalized Try-On Result Active (Strictly 1 genuine frontal image) */
                <div className="space-y-3">
                  <div className="bg-plum/80 border border-champagne/20 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-burgundy text-champagne font-bold border border-champagne/40 px-3 py-1.5 rounded-lg text-xs font-brand uppercase tracking-wider flex items-center gap-1.5 shadow-gold-subtle">
                        <Sparkles className="w-3.5 h-3.5 text-champagne" />
                        <span>Your Try-On (Front View)</span>
                      </span>
                    </div>

                    <button
                      onClick={handleResetResult}
                      className="text-xs text-champagne hover:text-champagne-light bg-plum-dark/60 border border-champagne/20 px-3 py-1.5 rounded-lg transition-colors font-brand uppercase tracking-wider"
                    >
                      View Catalog Garment
                    </button>
                  </div>

                  {/* Explicit Mandatory Notice: Additional views are not available yet */}
                  <div className="bg-plum-dark/95 border border-champagne/30 rounded-xl p-3.5 flex items-start gap-3 text-xs shadow-md">
                    <Info className="w-4 h-4 text-champagne flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-champagne font-semibold text-xs font-brand">
                        Additional views are not available yet.
                      </p>
                      <p className="text-ivory/70 text-[11px] leading-relaxed font-light">
                        The neural draping engine has generated an authentic frontal view of your portrait wearing {currentDress.name}. Side, back, and 360° views of your personalized try-on are not supported by the provider.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode 2: Catalog Multi-View Studio (Genuine photos only, NO CSS rotateY page flip) */
                <div className="space-y-3">
                  <div className="bg-plum/80 border border-champagne/20 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {genuineViews.map((view) => (
                        <button
                          key={view.id}
                          onClick={() => setActiveView(view.id)}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-brand uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                            activeView === view.id
                              ? 'bg-burgundy text-champagne font-bold border border-champagne/40 shadow-gold-subtle'
                              : 'text-ivory/70 hover:text-champagne hover:bg-plum-dark/60'
                          }`}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>

                    {genuineViews.length > 1 && (
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-ivory/50 font-brand">
                        <MoveHorizontal className="w-3.5 h-3.5 text-champagne/70" />
                        <span>Drag photo to change view</span>
                      </div>
                    )}
                  </div>

                  {genuineViews.length <= 1 && (
                    <div className="bg-plum/70 border border-champagne/20 rounded-xl px-3.5 py-2 flex items-center justify-center gap-2 text-xs text-center">
                      <Info className="w-3.5 h-3.5 text-champagne/80 flex-shrink-0" />
                      <span className="text-ivory/70 text-[11px]">
                        Additional views are not available yet for this catalog garment.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Main Visual Display Stage */}
              <div
                className={`relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-dark border border-champagne/30 shadow-2xl flex items-center justify-center select-none ${
                  !renderedResultUrl && genuineViews.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
                onMouseDown={(e) => handlePointerDown(e.clientX)}
                onMouseUp={(e) => handlePointerUp(e.clientX)}
                onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
                onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
              >
                {tryOnError ? (
                  <div className="text-center p-8 space-y-3 bg-burgundy/40 border border-rose/30 rounded-xl m-4">
                    <p className="text-rose text-sm font-semibold">{tryOnError}</p>
                    <p className="text-ivory/60 text-xs">Please upload a valid front-facing portrait or select a calibrated atelier avatar to re-attempt neural fitting.</p>
                    <button
                      onClick={handleGenerate}
                      className="mt-2 bg-champagne text-plum font-bold text-xs uppercase px-4 py-2 rounded-lg"
                    >
                      Retry Neural Synthesis
                    </button>
                  </div>
                ) : isGenerating ? (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-champagne border-t-transparent animate-spin mx-auto flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-champagne" />
                    </div>
                    <p className="text-sm font-brand tracking-widest uppercase text-champagne">
                      Synthesizing precision couture draping on your portrait...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Clean Image Stage - ZERO CSS rotateY card-flip or transform */}
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <ImageWithFallback
                        src={getDisplayedImage()}
                        alt={`${currentDress.name} - ${activeView} view`}
                        aspectRatio="aspect-full"
                        className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
                      />
                    </div>

                    {/* Watermark / Brand Badge */}
                    <div className="absolute top-4 left-4 bg-plum-dark/90 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-lg flex items-center gap-2 z-10 shadow-luxury">
                      {renderedResultUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-champagne" />
                          <span className="text-[10px] font-brand tracking-wider uppercase text-champagne font-bold">
                            AI Virtual Try-On: {currentDress.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-champagne" />
                          <span className="text-[10px] font-brand tracking-wider uppercase text-ivory">
                            {currentDress.name} • {activeView.toUpperCase()} VIEW
                          </span>
                        </>
                      )}
                    </div>

                    {/* View Angle Pill */}
                    <div className="absolute top-4 right-4 bg-burgundy/90 backdrop-blur-md border border-champagne/40 px-3 py-1 rounded-full text-[10px] font-brand uppercase tracking-wider text-champagne z-10 shadow-luxury">
                      {renderedResultUrl ? '2D Neural Try-On Result ✓' : `${activeView.toUpperCase()} VIEW`}
                    </div>

                    {/* Quick Steppers (Left/Right Arrows) only when multiple genuine views exist for catalog garment */}
                    {!renderedResultUrl && genuineViews.length > 1 && (
                      <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevView();
                          }}
                          className="pointer-events-auto w-9 h-9 rounded-full bg-plum-dark/80 hover:bg-burgundy text-champagne border border-champagne/30 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                          title="Previous garment view"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextView();
                          }}
                          className="pointer-events-auto w-9 h-9 rounded-full bg-plum-dark/80 hover:bg-burgundy text-champagne border border-champagne/30 flex items-center justify-center transition-all shadow-lg hover:scale-105"
                          title="Next garment view"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Bottom Indicator Dots only for catalog garments with multiple views */}
                    {!renderedResultUrl && genuineViews.length > 1 && (
                      <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10 pointer-events-none">
                        {genuineViews.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveView(v.id);
                            }}
                            className={`pointer-events-auto transition-all rounded-full ${
                              activeView === v.id
                                ? 'w-6 h-2 bg-champagne'
                                : 'w-2 h-2 bg-ivory/40 hover:bg-ivory/80'
                            }`}
                            title={`Switch to ${v.label}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Details Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-[10px] text-ivory/50 uppercase tracking-widest block">Selected Couture Piece</span>
                  <h4 className="text-lg font-editorial font-bold text-ivory">{currentDress.name}</h4>
                  <span className="text-xs text-champagne font-editorial font-bold">
                    PKR {currentDress.price.toLocaleString()} • {currentDress.fabric}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {renderedResultUrl && (
                    <>
                      <a
                        href={renderedResultUrl}
                        download={`StyleMira_TryOn_${currentDress.name.replace(/\s+/g, '_')}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/40 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all"
                      >
                        Save Photo
                      </a>
                      <button
                        onClick={handleResetResult}
                        className="bg-plum-dark hover:bg-rose/20 text-rose border border-rose/40 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all"
                      >
                        Delete Result
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => addToCart(currentDress)}
                    className="bg-champagne hover:bg-champagne-light text-plum font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-gold-subtle transition-all"
                  >
                    Add This Look to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
