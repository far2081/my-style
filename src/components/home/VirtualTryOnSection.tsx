import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { CameraModal } from '../common/CameraModal';
import { Sparkles, RotateCw, Check, Info, ChevronLeft, ChevronRight, MoveHorizontal, Camera, Upload, X, Search, Filter, Eye, Maximize2, Split, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { aiProviders } from '../../services/aiProvider';
import { normalizeTo3x4Portrait } from '../../utils/imageNormalization';

type GarmentViewAngle = 'front' | 'left' | 'right' | 'back';

export const VirtualTryOnSection: React.FC = () => {
  const {
    tryOnProduct,
    setTryOnProduct,
    setSelectedProduct,
    addToCart,
    products,
    customerPhoto,
    setCustomerPhoto,
    customerBodyPhoto,
    setCustomerBodyPhoto,
    customerBodyStructure,
    setCustomerBodyStructure,
    personalizedTryOnUrl,
    setPersonalizedTryOnUrl,
    personalizedTryOnProductId,
    setPersonalizedTryOnProductId,
    activeFilterOccasion,
    setActiveView: setPageActiveView,
  } = useApp();

  const currentDress = tryOnProduct || products[0] || PRODUCTS_DATA[0];

  const [activeView, setActiveView] = useState<GarmentViewAngle>('front');
  const [photoType, setPhotoType] = useState<'portrait' | 'fullbody' | 'unknown'>('unknown');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnGenerated, setTryOnGenerated] = useState(false);
  const [renderedResultUrl, setRenderedResultUrl] = useState<string | null>(
    personalizedTryOnProductId === currentDress.id ? personalizedTryOnUrl : null
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [compareMode, setCompareMode] = useState<'single' | 'split'>('single');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Clear stale try-on result whenever a new dress is selected
  useEffect(() => {
    if (personalizedTryOnProductId && personalizedTryOnProductId !== currentDress.id) {
      setRenderedResultUrl(null);
      setTryOnGenerated(false);
    } else if (personalizedTryOnProductId === currentDress.id && personalizedTryOnUrl) {
      setRenderedResultUrl(personalizedTryOnUrl);
      setTryOnGenerated(true);
    }
  }, [currentDress.id, personalizedTryOnProductId, personalizedTryOnUrl]);

  // Category & Color Filtering for Step 2
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sync category filter if user came from QuickStyleFinder or AIStylist
  useEffect(() => {
    if (activeFilterOccasion) {
      const occ = activeFilterOccasion.toLowerCase();
      if (occ.includes('barat')) setSelectedCategory('Barat');
      else if (occ.includes('nikah')) setSelectedCategory('Nikah');
      else if (occ.includes('valima') || occ.includes('walima')) setSelectedCategory('Valima');
      else if (occ.includes('party')) setSelectedCategory('Party');
      else if (occ.includes('casual')) setSelectedCategory('Casual');
      else if (occ.includes('winter')) setSelectedCategory('Winter');
      else if (occ.includes('summer')) setSelectedCategory('Summer');
      else if (occ.includes('mehndi')) setSelectedCategory('Mehndi');
      else if (occ.includes('bridal')) setSelectedCategory('Bridal');
      else if (occ.includes('formal')) setSelectedCategory('Formal');
      else if (occ.includes('festive')) setSelectedCategory('Festive');
      else if (occ.includes('luxury') || occ.includes('pret')) setSelectedCategory('Luxury Pret');
    }
  }, [activeFilterOccasion]);

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Barat', value: 'Barat' },
    { label: 'Nikah', value: 'Nikah' },
    { label: 'Valima', value: 'Valima' },
    { label: 'Party', value: 'Party' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Winter', value: 'Winter' },
    { label: 'Summer', value: 'Summer' },
    { label: 'Bridal', value: 'Bridal' },
    { label: 'Mehndi', value: 'Mehndi' },
    { label: 'Formal', value: 'Formal' },
    { label: 'Festive', value: 'Festive' },
    { label: 'Luxury Pret', value: 'Luxury Pret' },
  ];

  const colorOptions = [
    'All',
    'Burgundy',
    'Maroon',
    'Crimson',
    'Champagne',
    'Mint',
    'Mustard',
    'Emerald',
    'Navy',
    'Peach',
    'Plum',
    'Gold',
    'Silver',
  ];

  // Filtered dresses based on Category, Color, and Search
  const filteredDresses = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const catKey = selectedCategory.toLowerCase().replace(/[\s-]/g, '');
        const pOccasion = (p.occasion || '').toLowerCase().replace(/[\s-]/g, '');
        const pCategory = (p.category || '').toLowerCase().replace(/[\s-]/g, '');
        const pEvent = (p.event || '').toLowerCase().replace(/[\s-]/g, '');
        const pSeason = (p.season || '').toLowerCase().replace(/[\s-]/g, '');
        const pTags = (p.tags || []).map((t: string) => t.toLowerCase().replace(/[\s-]/g, '')).join(' ');

        const isValimaWalima =
          (catKey === 'valima' || catKey === 'walima') &&
          (pOccasion.includes('valima') || pOccasion.includes('walima') || pEvent.includes('valima') || pEvent.includes('walima'));

        if (
          !isValimaWalima &&
          !pOccasion.includes(catKey) &&
          !pCategory.includes(catKey) &&
          !pEvent.includes(catKey) &&
          !pSeason.includes(catKey) &&
          !pTags.includes(catKey)
        ) {
          return false;
        }
      }

      // Color filter
      if (selectedColor !== 'All') {
        const cLower = selectedColor.toLowerCase();
        const pColor = (p.color || '').toLowerCase();
        const pSecondaries = (p.secondaryColors || []).map((c) => c.toLowerCase());
        if (!pColor.includes(cLower) && !pSecondaries.some((sc) => sc.includes(cLower))) {
          return false;
        }
      }

      // Keyword Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesFabric = (p.fabric || '').toLowerCase().includes(q);
        const matchesType = (p.dressType || '').toLowerCase().includes(q);
        if (!matchesName && !matchesFabric && !matchesType) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedColor, searchTerm]);

  // Available sample models (Full-length standing atelier models for complete silhouette try-on)
  const sampleModels = [
    { id: 'm1', name: 'Zoya (Warm Ivory)', img: '/images/categories/Casual/dress_01.jpg' },
    { id: 'm2', name: 'Ayla (Deep Wheatish)', img: '/images/categories/Festive/dress_01.jpg' },
    { id: 'm3', name: 'Mahnoor (Porcelain)', img: '/images/categories/Party/dress_01.jpg' },
  ];

  const [selectedSample, setSelectedSample] = useState(sampleModels[0].img);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement>(null);
  const bodyFileInputRef = useRef<HTMLInputElement>(null);
  const [framingNotice, setFramingNotice] = useState<string | null>(null);
  const [resultAssessment, setResultAssessment] = useState<{
    coverage: 'full-length' | 'knee-length' | 'waist-length';
    dimensions?: { width: number; height: number };
    label: string;
    notice?: string;
  } | null>(null);

  // Analyze generated AI Try-On image dimensions and coverage ratio
  useEffect(() => {
    if (!renderedResultUrl) {
      setResultAssessment(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 768;
      const h = img.naturalHeight || 1024;
      const ratio = h / w;

      if (ratio >= 1.22) {
        setResultAssessment({
          coverage: 'full-length',
          dimensions: { width: w, height: h },
          label: 'Full-Length Silhouette Fitted ✓',
        });
      } else if (ratio >= 1.05) {
        setResultAssessment({
          coverage: 'knee-length',
          dimensions: { width: w, height: h },
          label: 'Knee-Length Fitted Silhouette',
          notice:
            'Output terminates around the knees. Full floor-length hemline synthesis requires both a head-to-feet customer photo AND a complete floor-length catalog photo.',
        });
      } else {
        setResultAssessment({
          coverage: 'waist-length',
          dimensions: { width: w, height: h },
          label: 'Bodice & Neckline Fitted',
          notice: 'Partial crop detected. Garment fitted to visible customer frame.',
        });
      }
    };
    img.src = renderedResultUrl;
  }, [renderedResultUrl]);

  // Helper to detect image framing, completeness, and orientation
  const detectPhotoFraming = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 640;
      const h = img.naturalHeight || 480;
      const ratio = h / w;

      // Validate resolution & completeness
      if (w < 256 || h < 256) {
        setFramingNotice('Image resolution is very low (< 256px). Please retake or upload a higher resolution photo for authentic fitting.');
      } else if (ratio < 0.8) {
        setFramingNotice('Wide landscape frame detected. Full-length dress fitting requires an upright portrait (standing 6–8 ft back) so head, torso, and feet are all in frame.');
      } else if (ratio < 1.25) {
        setFramingNotice('Knee/mid-length crop detected. To drape the full skirt down to the hemline, please step back so your entire body from head to shoes is visible.');
      } else {
        setFramingNotice(null);
      }

      // Default to fullbody fitting mode so customerPhoto is used as complete avatar
      setPhotoType('fullbody');
    };
    img.src = dataUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const normalized = await normalizeTo3x4Portrait(reader.result);
          setCustomerPhoto(normalized);
          detectPhotoFraming(normalized);
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

  const handleBodyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const normalized = await normalizeTo3x4Portrait(reader.result);
          setCustomerBodyPhoto(normalized);
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
    detectPhotoFraming(photoDataUrl);
    setSelectedSample('');
    setRenderedResultUrl(null);
    setPersonalizedTryOnUrl(null);
    setPersonalizedTryOnProductId(null);
    setTryOnGenerated(false);
  };

  const handleClearPhoto = () => {
    setCustomerPhoto(null);
    setCustomerBodyPhoto(null);
    setPhotoType('unknown');
    setFramingNotice(null);
    setSelectedSample(sampleModels[0].img);
    setRenderedResultUrl(null);
    setPersonalizedTryOnUrl(null);
    setPersonalizedTryOnProductId(null);
    setTryOnGenerated(false);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Guarantee that Front, Left, Right, Back ALL show the EXACT SAME SELECTED DRESS
  const genuineViews: Array<{ id: GarmentViewAngle; label: string; url: string }> = useMemo(() => [
    { id: 'front', label: 'Front View', url: currentDress.images.front },
    { id: 'left', label: 'Left Profile', url: currentDress.images.left || currentDress.images.front },
    { id: 'right', label: 'Right Profile', url: currentDress.images.right || currentDress.images.front },
    { id: 'back', label: 'Back View', url: currentDress.images.back || currentDress.images.front },
  ], [currentDress]);

  // Preload genuine garment image
  useEffect(() => {
    const img = new Image();
    img.src = currentDress.images.front;
  }, [currentDress]);

  // When dress changes or new result is generated, ensure activeView starts at front
  useEffect(() => {
    setActiveView('front');
  }, [currentDress.id, renderedResultUrl]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTryOnError(null);
    setJobStatus('processing');

    let photoToUse = customerPhoto || selectedSample;

    // If using sample model image URL, convert it to base64 Data URL so RapidAPI receives direct file bytes
    if (photoToUse && !photoToUse.startsWith('data:image/')) {
      try {
        const response = await fetch(photoToUse);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        photoToUse = base64Data;
      } catch (err) {
        console.warn('Could not convert sample model to base64, passing URL as-is:', err);
      }
    }

    const selectedGarmentImage =
      currentDress.images?.fullLook && currentDress.images.fullLook.trim()
        ? currentDress.images.fullLook
        : currentDress.images.front;

    // Normalize customer image to clean 768x1024 (3:4 portrait) canvas so person and 3:4 dress share identical proportions
    const normalizedAvatar = await normalizeTo3x4Portrait(photoToUse);

    const res = await aiProviders.tryon.generateTryOn({
      customerPhotoUrl: normalizedAvatar,
      customerFaceUrl: customerPhoto || undefined,
      customerBodyUrl: customerBodyPhoto || (photoType === 'fullbody' ? normalizedAvatar : undefined),
      bodyStructure: customerBodyStructure,
      garmentImageUrl: selectedGarmentImage,
      productId: currentDress.id,
      productName: currentDress.name,
      dressType: currentDress.dressType,
      category: currentDress.category,
      color: currentDress.color,
      fabric: currentDress.fabric,
      description: currentDress.description,
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

  // Resolve currently displayed image:
  // If personalized try-on is active -> display genuine generated try-on
  // If catalog dress is active -> always display the exact selected dress
  const getDisplayedImage = () => {
    if (renderedResultUrl) {
      return renderedResultUrl;
    }
    return currentDress.images.front;
  };

  // View navigation helpers for catalog views
  const currentViewIndex = genuineViews.findIndex((v) => v.id === activeView);

  const handleNextView = () => {
    if (renderedResultUrl) return;
    const nextIndex = (currentViewIndex + 1) % genuineViews.length;
    setActiveView(genuineViews[nextIndex].id);
  };

  const handlePrevView = () => {
    if (renderedResultUrl) return;
    const prevIndex = (currentViewIndex - 1 + genuineViews.length) % genuineViews.length;
    setActiveView(genuineViews[prevIndex].id);
  };

  // Drag / Swipe handlers for genuine views
  const handlePointerDown = (clientX: number) => {
    if (renderedResultUrl) return;
    setIsDragging(true);
    setDragStartX(clientX);
  };

  const handlePointerUp = (clientX: number) => {
    if (!isDragging || renderedResultUrl) return;
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
            Upload your portrait, select from our heirloom Pakistani couture library of 120 authentic dresses across all wedding occasions, and witness precision photorealistic drape synthesis.
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
            {/* Left Controls Column (5 cols for richer catalog browsing) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Step 1: Customer Photo Selector */}
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

                {/* If Customer Uploaded Photo, show Preview Card with object-contain to PRESERVE full frame */}
                {customerPhoto ? (
                  <div className="space-y-3 mb-4">
                    <div className="relative rounded-2xl overflow-hidden min-h-[260px] max-h-[380px] aspect-[3/4] sm:aspect-[9/16] max-w-[280px] mx-auto border border-champagne/40 bg-charcoal/95 flex items-center justify-center p-1.5 shadow-inner">
                      <img
                        src={customerPhoto}
                        alt="Your Uploaded Portrait"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <div className="absolute top-2 left-2 bg-plum-dark/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-champagne/30 text-[9px] font-brand uppercase tracking-wider text-champagne flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Full-Frame (Uncropped)</span>
                      </div>
                      <div className="absolute bottom-2 inset-x-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-plum-dark/95 hover:bg-burgundy text-champagne border border-champagne/30 text-[10px] py-1.5 rounded-lg transition-colors font-medium backdrop-blur-sm shadow-md"
                        >
                          Upload New
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[VirtualTryOn] Retake Camera clicked');
                            setIsCameraOpen(true);
                          }}
                          className="flex-1 bg-plum-dark/95 hover:bg-burgundy text-champagne border border-champagne/30 px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-medium backdrop-blur-sm shadow-md"
                          title="Retake Full-Body Portrait"
                        >
                          <RotateCw className="w-3 h-3 text-champagne" />
                          <span>Retake</span>
                        </button>
                      </div>
                    </div>

                    {/* Framing Check & Incomplete Photo Advisory Notice */}
                    {framingNotice && (
                      <div className="bg-burgundy/40 border border-champagne/30 rounded-xl p-3 text-[11px] text-ivory/90 space-y-2 font-light">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-champagne flex-shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-semibold text-champagne font-brand uppercase tracking-wider text-[10px]">Framing Advisory:</p>
                            <p className="leading-snug text-ivory/80">{framingNotice}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCameraOpen(true);
                          }}
                          className="w-full bg-champagne hover:bg-champagne-light text-plum font-bold text-[10px] uppercase tracking-wider py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-gold-subtle"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Retake with Full-Body Guide</span>
                        </button>
                      </div>
                    )}

                    {/* Educational Guidance Notice when Reference Photo is uploaded */}
                    <div className="bg-plum-dark/90 border border-champagne/25 rounded-xl p-3 text-[11px] text-ivory/80 space-y-2 font-light">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-champagne flex-shrink-0 mt-0.5" />
                        <p className="leading-snug">
                          <strong className="text-champagne font-normal">Full-Body Fitting Active:</strong> Your complete portrait will be used for head-to-toe drape synthesis. You can optionally attach an additional reference photo below!
                        </p>
                      </div>

                      {/* Optional Separate Full-Body Reference Photo Upload */}
                      {customerBodyPhoto ? (
                        <div className="flex items-center justify-between bg-plum/60 p-2 rounded-lg border border-champagne/20 text-[10px]">
                          <span className="text-champagne truncate">Additional Reference Attached ✓</span>
                          <button
                            onClick={() => setCustomerBodyPhoto(null)}
                            className="text-rose hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => bodyFileInputRef.current?.click()}
                          className="w-full bg-burgundy/60 hover:bg-burgundy text-champagne border border-champagne/30 text-[10px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3 h-3 text-champagne" />
                          <span>Add Optional Reference Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Upload / Camera CTAs */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/30 p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">Upload Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('[VirtualTryOn] Start Camera clicked');
                          setIsCameraOpen(true);
                        }}
                        className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/30 p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">Start Camera</span>
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
                              setCustomerBodyPhoto(null);
                              setPhotoType('unknown');
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

                {/* Body Structure Selection for Accurate Runway & Fitting */}
                <div className="mt-4 pt-3 border-t border-champagne/15">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-brand uppercase tracking-wider text-ivory/70">
                      Silhouette & Body Structure:
                    </span>
                    <span className="text-[10px] text-champagne font-brand font-semibold">
                      {customerBodyStructure.split(' ')[0]}
                    </span>
                  </div>
                  <select
                    value={customerBodyStructure}
                    onChange={(e) => setCustomerBodyStructure(e.target.value)}
                    className="w-full bg-plum-dark/90 border border-champagne/30 text-champagne text-xs font-brand rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-champagne"
                  >
                    <option value="Hourglass / Curated">Hourglass / Curated</option>
                    <option value="Pear / Flared Hem">Pear / Flared Hem</option>
                    <option value="Petite / Balanced">Petite / Balanced</option>
                    <option value="Athletic / Straight">Athletic / Straight</option>
                    <option value="Plus Size / Royal Flare">Plus Size / Royal Flare</option>
                  </select>
                  <p className="text-[9px] text-ivory/50 mt-1.5 font-light">
                    Calibrates 3D garment drape & proportions without altering or cropping your face portrait.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <input
                  ref={cameraCaptureInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <input
                  ref={bodyFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/*"
                  className="hidden"
                  onChange={handleBodyFileUpload}
                />
              </div>

              {/* Step 2: Selected Dress Selector with Category Filters */}
              <div className="bg-plum/70 border border-champagne/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-brand uppercase tracking-wider text-champagne font-bold">
                    Step 2: Choose Your Dress ({filteredDresses.length} Available)
                  </span>
                  <span className="text-[10px] text-champagne-light font-mono font-bold">
                    {currentDress.occasion}
                  </span>
                </div>

                {/* Category Selector Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-brand uppercase tracking-wider whitespace-nowrap transition-all border ${
                        selectedCategory === cat.value
                          ? 'bg-burgundy text-champagne border-champagne font-bold shadow-sm'
                          : 'bg-plum-dark/60 text-ivory/70 border-champagne/20 hover:text-champagne hover:border-champagne/40'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Quick Color Filter & Search */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full bg-plum-dark/80 border border-champagne/25 text-ivory text-[10px] font-brand rounded-lg px-2 py-1.5 focus:outline-none focus:border-champagne"
                    >
                      {colorOptions.map((c) => (
                        <option key={c} value={c} className="bg-plum-dark text-ivory">
                          {c === 'All' ? 'All Colors' : c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search dress..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-plum-dark/80 border border-champagne/25 text-ivory text-[10px] font-brand rounded-lg pl-7 pr-2 py-1.5 focus:outline-none focus:border-champagne placeholder:text-ivory/40"
                    />
                    <Search className="w-3 h-3 text-champagne/70 absolute left-2 top-2 pointer-events-none" />
                  </div>
                </div>

                {/* Dress Cards List - Exact Selected Dress Guaranteed */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredDresses.length === 0 ? (
                    <div className="text-center py-6 text-xs text-ivory/50">
                      No dresses match the selected filters.
                    </div>
                  ) : (
                    filteredDresses.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          setTryOnProduct(prod);
                          setSelectedProduct(prod);
                          setRenderedResultUrl(null);
                          setPersonalizedTryOnUrl(null);
                          setPersonalizedTryOnProductId(null);
                          setTryOnGenerated(false);
                          setActiveView('front');
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all ${
                          currentDress.id === prod.id
                            ? 'bg-burgundy/90 border-champagne text-champagne shadow-gold-subtle'
                            : 'bg-plum-dark/50 border-champagne/15 text-ivory/80 hover:bg-plum/60 hover:border-champagne/40'
                        }`}
                      >
                        <img
                          src={prod.images.front}
                          alt={prod.name}
                          className="w-12 h-14 rounded-lg object-cover flex-shrink-0 border border-champagne/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-ivory">{prod.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] bg-plum px-1.5 py-0.5 rounded text-champagne border border-champagne/20 uppercase tracking-wider font-brand">
                              {prod.occasion}
                            </span>
                            <span className="text-[10px] text-champagne font-bold font-mono">
                              PKR {prod.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {currentDress.id === prod.id && (
                          <Check className="w-4 h-4 text-champagne flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
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

            {/* Right Interactive Try-On Viewer (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {renderedResultUrl ? (
                /* Mode 1: Personalized Try-On Result Active (Strictly 1 genuine frontal image) */
                <div className="space-y-3">
                  <div className="bg-plum/80 border border-champagne/20 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-burgundy text-champagne font-bold border border-champagne/40 px-3 py-1.5 rounded-lg text-xs font-brand uppercase tracking-wider flex items-center gap-1.5 shadow-gold-subtle">
                        <Sparkles className="w-3.5 h-3.5 text-champagne" />
                        <span>Your Try-On (Front View)</span>
                      </span>

                      {/* Side-by-side comparison toggle */}
                      <div className="flex items-center bg-plum-dark/90 border border-champagne/25 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setCompareMode('single')}
                          className={`px-2.5 py-1 rounded text-[10px] font-brand uppercase tracking-wider transition-all ${
                            compareMode === 'single'
                              ? 'bg-champagne text-plum font-bold shadow-sm'
                              : 'text-ivory/70 hover:text-champagne'
                          }`}
                        >
                          Single View
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompareMode('split')}
                          className={`px-2.5 py-1 rounded text-[10px] font-brand uppercase tracking-wider transition-all flex items-center gap-1 ${
                            compareMode === 'split'
                              ? 'bg-champagne text-plum font-bold shadow-sm'
                              : 'text-ivory/70 hover:text-champagne'
                          }`}
                        >
                          <Split className="w-3 h-3" />
                          <span>Compare Original</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsZoomModalOpen(true)}
                        className="text-xs text-champagne hover:text-champagne-light bg-plum-dark/60 border border-champagne/20 px-3 py-1.5 rounded-lg transition-colors font-brand uppercase tracking-wider flex items-center gap-1"
                        title="Enlarge high-resolution try-on"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetResult}
                        className="text-xs text-champagne hover:text-champagne-light bg-plum-dark/60 border border-champagne/20 px-3 py-1.5 rounded-lg transition-colors font-brand uppercase tracking-wider"
                      >
                        View Catalog Garment
                      </button>
                    </div>
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
                /* Mode 2: Catalog Garment Multi-Angle Viewer (SAME dress guaranteed on all angles!) */
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

                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-ivory/60 font-brand">
                      <MoveHorizontal className="w-3.5 h-3.5 text-champagne" />
                      <span>Drag photo to change view</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Visual Display Stage - Full head-to-toe outfit and face preservation */}
              <div
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-charcoal-dark border border-champagne/30 shadow-2xl flex items-center justify-center select-none ${
                  !renderedResultUrl ? 'cursor-grab active:cursor-grabbing' : ''
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
                    {/* Clean Image Stage - ZERO CSS rotateY card-flip or transform, object-contain preserves entire body and face */}
                    {renderedResultUrl && compareMode === 'split' ? (
                      <div className="w-full h-full grid grid-cols-2 gap-1 bg-black/80 p-1">
                        <div className="relative h-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-charcoal/60 border border-champagne/15">
                          <img
                            src={currentDress.images.front}
                            alt={`${currentDress.name} - Original`}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          <span className="absolute bottom-2 bg-plum-dark/90 border border-champagne/30 text-[9px] font-brand uppercase tracking-wider text-champagne px-2 py-0.5 rounded">
                            Original Garment
                          </span>
                        </div>
                        <div className="relative h-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-charcoal/60 border border-champagne/30">
                          <img
                            src={renderedResultUrl}
                            alt={`${currentDress.name} - AI Try-On`}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          <span className="absolute bottom-2 bg-burgundy/90 border border-champagne/40 text-[9px] font-brand uppercase tracking-wider text-champagne font-bold px-2 py-0.5 rounded shadow-gold-subtle">
                            Your Neural Try-On
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black/60">
                        <img
                          src={getDisplayedImage()}
                          alt={`${currentDress.name} - ${activeView} view`}
                          className="w-full h-full object-contain transition-opacity duration-300 pointer-events-none"
                        />
                      </div>
                    )}

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

                    {/* View Angle / Result Assessment Pill */}
                    <div className="absolute top-4 right-4 bg-burgundy/90 backdrop-blur-md border border-champagne/40 px-3 py-1 rounded-full text-[10px] font-brand uppercase tracking-wider text-champagne z-10 shadow-luxury flex items-center gap-1.5">
                      {renderedResultUrl ? (
                        <>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              resultAssessment?.coverage === 'full-length'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span>{resultAssessment?.label || '2D Neural Try-On Result ✓'}</span>
                        </>
                      ) : (
                        `${activeView.toUpperCase()} VIEW`
                      )}
                    </div>

                    {/* Quick Steppers (Left/Right Arrows) for cycling views of the same dress */}
                    {!renderedResultUrl && (
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

                    {/* Transparent Diagnostic Assessment for Partial or Knee-Crop Results */}
                    {renderedResultUrl && resultAssessment?.notice && (
                      <div className="absolute bottom-4 inset-x-4 bg-plum-dark/95 backdrop-blur-md border border-champagne/40 rounded-xl px-3.5 py-2 text-center text-[10px] text-ivory/90 shadow-xl flex items-center justify-center gap-2 z-10 pointer-events-none">
                        <Info className="w-3.5 h-3.5 text-champagne flex-shrink-0" />
                        <span>{resultAssessment.notice}</span>
                      </div>
                    )}

                    {/* Customer Photo / Face Inset Badge - Preserved alongside main result as in AI Stylist */}
                    {customerPhoto && (
                      <div className="absolute bottom-4 right-4 w-20 h-24 rounded-xl overflow-hidden border-2 border-champagne shadow-2xl bg-charcoal flex flex-col items-center justify-center p-0.5 z-20">
                        <img src={customerPhoto} alt="Your Portrait" className="w-full h-full object-contain" />
                        <div className="absolute inset-x-0 bottom-0 bg-plum-dark/95 text-center py-0.5 text-[8px] font-brand uppercase text-champagne font-bold">
                          Your Photo
                        </div>
                      </div>
                    )}

                    {/* Bottom Indicator Dots */}
                    {!renderedResultUrl && (
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
                    PKR {currentDress.price.toLocaleString()} • {currentDress.fabric} ({currentDress.color})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {renderedResultUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const runwayEl = document.getElementById('runway');
                          if (runwayEl) {
                            runwayEl.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            setPageActiveView('runway');
                            setTimeout(() => {
                              const el = document.getElementById('runway');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }
                        }}
                        className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-gold-glow flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-plum" />
                        <span>Walk on 3D Runway</span>
                      </button>
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const runwayEl = document.getElementById('runway');
                        if (runwayEl) {
                          runwayEl.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          setPageActiveView('runway');
                          setTimeout(() => {
                            const el = document.getElementById('runway');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className="bg-plum hover:bg-burgundy text-champagne border border-champagne/40 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-champagne" />
                      <span>View on 3D Runway</span>
                    </button>
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

      {/* High-Resolution Zoom Modal */}
      {isZoomModalOpen && renderedResultUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/95 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-plum-dark border border-champagne/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-champagne/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-champagne" />
                <span className="font-editorial text-lg text-ivory font-bold uppercase">
                  {currentDress.name} — High-Res Neural Fitting
                </span>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 text-ivory/70 hover:text-champagne transition-colors"
                aria-label="Close zoom"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src={renderedResultUrl}
                alt={`${currentDress.name} - High-Res Try-On`}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs">
              <span className="text-champagne font-brand tracking-wider uppercase">
                Authentic 2D Frontal Synthesis • {currentDress.fabric} ({currentDress.color})
              </span>
              <div className="flex gap-2">
                <a
                  href={renderedResultUrl}
                  download={`StyleMira_HighRes_${currentDress.name.replace(/\s+/g, '_')}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-champagne text-plum font-bold uppercase px-4 py-2 rounded-lg shadow-gold-subtle"
                >
                  Download Full-Res
                </a>
                <button
                  onClick={() => setIsZoomModalOpen(false)}
                  className="bg-plum-dark border border-champagne/30 text-champagne uppercase px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
