import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { CameraModal } from '../common/CameraModal';
import { Sparkles, Camera, Upload, RotateCw, Check, ArrowRight, Eye, Layers, X } from 'lucide-react';
import { Product } from '../../types';
import { aiProviders } from '../../services/aiProvider';

export const VirtualTryOnSection: React.FC = () => {
  const { tryOnProduct, setTryOnProduct, addToCart, products, customerPhoto, setCustomerPhoto } = useApp();

  const currentDress = tryOnProduct || products[0] || PRODUCTS_DATA[0];

  const [activeAngle, setActiveAngle] = useState<'front' | 'left' | 'right' | 'back' | '360'>('front');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnGenerated, setTryOnGenerated] = useState(false);
  const [renderedResultUrl, setRenderedResultUrl] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
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
    setTryOnGenerated(false);
  };

  const handleClearPhoto = () => {
    setCustomerPhoto(null);
    setSelectedSample(sampleModels[0].img);
    setRenderedResultUrl(null);
    setTryOnGenerated(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTryOnError(null);
    setJobStatus('processing');

    const photoToUse = customerPhoto || selectedSample;
    const res = await aiProviders.tryon.generateTryOn({
      customerPhotoUrl: photoToUse,
      garmentImageUrl: currentDress.images.front,
      productId: currentDress.id,
      perspectiveAngle: (activeAngle === 'back' ? 'Back' : activeAngle === 'left' || activeAngle === 'right' ? 'Side' : 'Front') as any,
    });

    setIsGenerating(false);
    if (res.status === 'failed' || !res.result?.renderedImageUrl) {
      setJobStatus('failed');
      setTryOnError(res.error || 'Virtual Try-On generation failed. Please check provider connection.');
    } else {
      setJobStatus('completed');
      setTryOnGenerated(true);
      setRenderedResultUrl(res.result.renderedImageUrl);
    }
  };

  const handleResetResult = () => {
    setRenderedResultUrl(null);
    setTryOnGenerated(false);
    setJobStatus('idle');
  };

  // Base image: always preserve the actual generated result or catalog dress
  const getDisplayedImage = () => {
    if (renderedResultUrl) return renderedResultUrl;
    return currentDress.images.front;
  };

  // 3D perspective style for angles (Front, Left, Right, Back, 360)
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
            Upload your portrait, select from our heirloom Pakistani couture library, and witness precision photorealistic drape synthesis across multi-angle perspectives.
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
                        className="flex-1 bg-burgundy/90 hover:bg-burgundy text-champagne border border-champagne/30 text-[10px] py-1.5 rounded-lg transition-colors"
                      >
                        Retake Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-burgundy/80 hover:bg-burgundy border border-champagne/30 rounded-lg p-2.5 text-xs flex flex-col items-center justify-center gap-1 transition-colors text-ivory"
                    >
                      <Upload className="w-4 h-4 text-champagne" />
                      <span className="text-[10px] uppercase font-semibold">Upload Photo</span>
                    </button>

                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="bg-burgundy/80 hover:bg-burgundy border border-champagne/30 rounded-lg p-2.5 text-xs flex flex-col items-center justify-center gap-1 transition-colors text-ivory"
                    >
                      <Camera className="w-4 h-4 text-champagne" />
                      <span className="text-[10px] uppercase font-semibold">Take Photo</span>
                    </button>
                  </div>
                )}

                {/* Sample Avatars */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ivory/50 block mb-2">
                    Or select pre-calibrated avatar:
                  </span>
                  <div className="flex gap-2">
                    {sampleModels.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedSample(m.img);
                          setCustomerPhoto(null);
                        }}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-transform ${
                          !customerPhoto && selectedSample === m.img
                            ? 'border-champagne scale-105 shadow-gold-subtle'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={m.name}
                      >
                        <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dress Selector */}
              <div className="bg-plum/70 border border-champagne/20 rounded-xl p-5">
                <span className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-3 font-bold">
                  Step 2: Choose Dress
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {products.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setTryOnProduct(prod);
                        setRenderedResultUrl(null);
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
              {/* Perspective Angle Switcher Tabs */}
              {/* Specification: Front, Left, Right, Back, 360° Multi-View */}
              <div className="bg-plum/80 border border-champagne/20 rounded-xl p-2 flex flex-wrap items-center justify-center gap-2">
                {(['front', 'left', 'right', 'back', '360'] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => {
                      setActiveAngle(angle);
                      if (angle === 'front') setRotationAngle(0);
                      else if (angle === 'left') setRotationAngle(-22);
                      else if (angle === 'right') setRotationAngle(22);
                      else if (angle === 'back') setRotationAngle(180);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-brand uppercase tracking-wider transition-all ${
                      activeAngle === angle
                        ? 'bg-burgundy text-champagne font-bold border border-champagne/40 shadow-gold-subtle'
                        : 'text-ivory/70 hover:text-champagne hover:bg-plum-dark/60'
                    }`}
                  >
                    {angle === '360' ? '360° Multi-View' : `${angle} View`}
                  </button>
                ))}
              </div>

              {/* Main Visual Display Stage */}
              <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-dark border border-champagne/30 shadow-2xl flex items-center justify-center">
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
                      Synthesizing 360° drape tension & lighting...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* The 3D Perspective Stage Container - renders the EXACT SAME LOOK across all angles */}
                    <div
                      className="w-full h-full flex items-center justify-center overflow-hidden"
                      style={getTransformStyle()}
                    >
                      <ImageWithFallback
                        src={getDisplayedImage()}
                        alt={`${currentDress.name} - ${activeAngle} view`}
                        aspectRatio="aspect-full"
                        className="w-full h-full object-cover transition-all duration-300 select-none"
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
                            {currentDress.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* View Angle Pill */}
                    <div className="absolute top-4 right-4 bg-burgundy/90 backdrop-blur-md border border-champagne/40 px-3 py-1 rounded-full text-[10px] font-brand uppercase tracking-wider text-champagne z-10 shadow-luxury">
                      {renderedResultUrl
                        ? '2D Neural Try-On Result ✓'
                        : activeAngle === '360'
                        ? `360° Simulation (${rotationAngle}°)`
                        : `${activeAngle.toUpperCase()} Perspective`}
                    </div>

                    {/* 360° Multi-View Slider / Rotation Controls - NEVER DISAPPEARS on click */}
                    {activeAngle === '360' && (
                      <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 bg-plum-dark/95 backdrop-blur-md border border-champagne/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-20 shadow-2xl">
                        <div className="flex items-center gap-2 text-champagne">
                          <RotateCw className="w-4 h-4 text-champagne animate-spin" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            360° Multi-View Simulation
                          </span>
                        </div>
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
                            title="Rotate 45 degrees left"
                          >
                            -45°
                          </button>
                          <button
                            type="button"
                            onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
                            className="px-2 py-1 rounded bg-plum text-[10px] text-champagne border border-champagne/20 hover:bg-burgundy transition-colors"
                            title="Rotate 45 degrees right"
                          >
                            +45°
                          </button>
                          <button
                            type="button"
                            onClick={() => setRotationAngle(0)}
                            className="px-2 py-1 rounded bg-plum text-[10px] text-champagne border border-champagne/20 hover:bg-burgundy transition-colors"
                            title="Reset to front"
                          >
                            Reset
                          </button>
                        </div>
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
