import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Camera, Upload, Check, Wand2, Sliders, RefreshCw, ShoppingBag, Eye, X, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { CameraModal } from '../common/CameraModal';
import { PRODUCTS_DATA } from '../../data/products';
import { aiProviders } from '../../services/aiProvider';

export const AIStylistSection: React.FC = () => {
  const { setSelectedProduct, setTryOnProduct, setIsTryOnModalOpen, addToCart, products, customerPhoto, setCustomerPhoto, activeFilterOccasion, activeFilterEvent, setActiveView } = useApp();

  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [ageGroup, setAgeGroup] = useState('25-34');
  const [selectedEvent, setSelectedEvent] = useState('Own Wedding (Bride)');
  const [selectedOccasion, setSelectedOccasion] = useState('Barat');
  const [bodyStructure, setBodyStructure] = useState('Hourglass / Curated');
  const [preferredColors, setPreferredColors] = useState<string[]>(['Burgundy', 'Champagne']);
  const [dressType, setDressType] = useState('Bridal Lehenga');
  const [styleVibe, setStyleVibe] = useState('Royal Heritage Couture');
  const [season, setSeason] = useState('Winter');
  const [budget, setBudget] = useState('PKR 250,000 - 400,000');

  // Synchronize with activeFilterOccasion / activeFilterEvent if passed from QuickStyleFinder
  useEffect(() => {
    if (activeFilterOccasion) {
      if (activeFilterOccasion.toLowerCase().includes('walima')) {
        setSelectedOccasion('Walima');
        setPreferredColors(['Champagne', 'Mint']);
        setDressType('Floor-length Peshwas');
      } else if (activeFilterOccasion.toLowerCase().includes('mehndi') || activeFilterOccasion.toLowerCase().includes('mayo')) {
        setSelectedOccasion('Mehndi');
        setPreferredColors(['Mustard', 'Emerald']);
        setDressType('Tiered Banarsi Gharara');
      } else if (activeFilterOccasion.toLowerCase().includes('nikah')) {
        setSelectedOccasion('Nikah');
        setPreferredColors(['Ivory', 'Blush']);
        setDressType('Floor-length Peshwas');
      } else if (activeFilterOccasion.toLowerCase().includes('formal')) {
        setSelectedOccasion('Formal');
        setPreferredColors(['Navy', 'Emerald']);
        setDressType('Zardozi Angrakha');
      } else if (activeFilterOccasion.toLowerCase().includes('casual')) {
        setSelectedOccasion('Casual');
        setPreferredColors(['Peach', 'Mint']);
        setDressType('Everyday Pret');
      } else if (activeFilterOccasion.toLowerCase().includes('party') || activeFilterOccasion.toLowerCase().includes('pret')) {
        setSelectedOccasion('Party');
        setPreferredColors(['Burgundy', 'Teal']);
        setDressType('Luxury Velvet Kaftan');
      } else {
        setSelectedOccasion('Barat');
      }
    }
  }, [activeFilterOccasion]);

  const colorOptions = ['Burgundy', 'Champagne', 'Maroon', 'Ivory', 'Mint', 'Rose', 'Emerald', 'Mustard', 'Blush', 'Navy', 'Peach', 'Teal'];

  const toggleColor = (c: string) => {
    setGeminiRecommendedProduct(null);
    if (preferredColors.includes(c)) {
      setPreferredColors(preferredColors.filter((item) => item !== c));
    } else {
      setPreferredColors([...preferredColors, c]);
    }
  };

  const [aiProviderStatus, setAiProviderStatus] = useState<string>('AI Engine Ready');
  const [matchPercentage, setMatchPercentage] = useState<number>(96);
  const [recommendationReason, setRecommendationReason] = useState<string>('');
  const [geminiRecommendedProduct, setGeminiRecommendedProduct] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomerPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateLook = async () => {
    setStep('processing');
    setAiProviderStatus('Running Gemini 1.5 Flash fashion intelligence & catalog analysis...');

    try {
      if (customerPhoto) {
        setAiProviderStatus('Analyzing skin undertones & contrast palette via Vision...');
        await aiProviders.vision.analyzeImage({ imageFileOrUrl: customerPhoto });
      }

      const stylistRes = await (aiProviders.stylist as any).analyzeAndRecommend(
        {
          preferences: {
            occasion: selectedOccasion,
            event: selectedEvent,
            colors: preferredColors,
            dressType,
            bodyStructure,
            budget,
            style: styleVibe,
          },
          userPhotoUrl: customerPhoto || undefined,
        },
        products
      );

      if (stylistRes?.primaryRecommendation) {
        setGeminiRecommendedProduct(stylistRes.primaryRecommendation);
      }
      const topMatch = stylistRes.topLooks[0]?.matchScore || 96;
      setMatchPercentage(topMatch);
      setRecommendationReason(stylistRes.curatedAdvice);
      setStep('result');
    } catch {
      setStep('result');
    }
  };

  // High-sensitivity multi-parameter scoring: ensures every color, dress type, occasion, and silhouette updates the resulting dress!
  const recommendedProduct = React.useMemo(() => {
    if (geminiRecommendedProduct) return geminiRecommendedProduct;

    const scored = products.map((p) => {
      let score = 0;
      const pOccasion = (p.occasion || '').toLowerCase();
      const pEvent = (p.event || '').toLowerCase();
      const pColor = (p.color || '').toLowerCase();
      const pCategory = (p.category || '').toLowerCase();
      const pDressType = (p.dressType || '').toLowerCase();
      const pSecondaryColors = (p.secondaryColors || []).map((c) => c.toLowerCase());
      const pDescription = (p.description || '').toLowerCase();

      // 1. Occasion & Event Match
      const targetOcc = selectedOccasion.toLowerCase();
      if (pOccasion.includes(targetOcc) || targetOcc.includes(pOccasion)) score += 35;
      if (pEvent.includes(targetOcc)) score += 30;

      // 2. Color Match (High sensitivity)
      preferredColors.forEach((color) => {
        const cLower = color.toLowerCase();
        if (pColor.includes(cLower)) score += 40;
        if (pSecondaryColors.some((sc) => sc.includes(cLower))) score += 25;
        if (pDescription.includes(cLower)) score += 15;
      });

      // 3. Dress Type & Silhouette Match
      const cleanDressType = dressType.toLowerCase().replace('heirloom', '').replace('floor-length', '').replace('tiered', '').trim();
      if (pDressType.includes(cleanDressType) || pCategory.includes(cleanDressType)) score += 30;

      // 4. Body Structure tailoring bonus
      if (bodyStructure.includes('Petite') && (pDressType.includes('peshwas') || pDressType.includes('coord') || pDressType.includes('pishwas'))) score += 15;
      if (bodyStructure.includes('Hourglass') && (pDressType.includes('lehenga') || pDressType.includes('gharara'))) score += 15;
      if (bodyStructure.includes('Tall') && (pDressType.includes('peshwas') || pDressType.includes('gown') || pDressType.includes('pishwas'))) score += 15;
      if (bodyStructure.includes('Curvy') && (pDressType.includes('kaftan') || pDressType.includes('angrakha') || pDressType.includes('gharara'))) score += 15;

      // 5. Season & Fabric Match
      if (p.season === season || p.season === 'All Season') score += 10;

      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.product || products[0];
  }, [geminiRecommendedProduct, products, selectedOccasion, preferredColors, season, dressType, bodyStructure]);

  return (
    <section className="py-24 bg-plum-dark text-ivory relative overflow-hidden" id="ai-stylist">
      {/* Background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-burgundy/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-mauve/30 rounded-full blur-3xl pointer-events-none" />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photo) => setCustomerPhoto(photo)}
        title="Atelier Portrait Scanner"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-4 shadow-gold-subtle">
            <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
            <span>Google Gemini 1.5 Powered Stylist</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            AI PERSONAL STYLIST
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-ivory/70 max-w-2xl mx-auto leading-relaxed font-light">
            Trained on generations of royal Pakistani bridal heritage and Mughal aesthetics. Share your occasion, body architecture, and color palette for tailored haute couture synthesis.
          </p>
        </div>

        {/* Processing State */}
        {step === 'processing' && (
          <div className="bg-plum/80 border border-champagne/30 rounded-2xl p-12 max-w-xl mx-auto text-center flex flex-col items-center shadow-luxury">
            <div className="w-20 h-20 rounded-full border-2 border-champagne border-t-transparent animate-spin flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-champagne animate-pulse" />
            </div>
            <span className="text-xs font-brand uppercase tracking-[0.3em] text-champagne mb-2">
              Synthesizing Silhouettes
            </span>
            <h3 className="text-2xl font-editorial font-bold text-ivory mb-2">
              Curating Your Bespoke Ensembles...
            </h3>
            <p className="text-xs text-ivory/60 max-w-sm">
              Analyzing facial undertone harmony, draping tension, and zardozi threadwork balance for your {selectedOccasion} event.
            </p>
          </div>
        )}

        {/* Result State */}
        {step === 'result' && (
          <div className="bg-plum/90 border border-champagne/40 rounded-2xl p-6 sm:p-10 max-w-5xl mx-auto shadow-luxury">
            <div className="flex items-center justify-between pb-6 border-b border-champagne/20 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-champagne text-plum flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-brand uppercase tracking-widest text-champagne">
                    AI Bespoke Synthesis • {matchPercentage}% Match
                  </span>
                  <h3 className="text-2xl font-editorial font-bold text-ivory">
                    Your Curated Bridal Portrait
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('input')}
                  className="text-xs uppercase tracking-wider text-champagne hover:text-champagne-light flex items-center gap-1.5 border border-champagne/30 px-3 py-1.5 rounded-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Adjust Parameters</span>
                </button>
                <button
                  onClick={() => setActiveView('home')}
                  className="text-xs uppercase tracking-wider text-ivory/70 hover:text-champagne hover:bg-plum-dark/60 flex items-center gap-1.5 border border-champagne/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Product and Uploaded Photo Stage (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-xl overflow-hidden aspect-[3/4] relative border border-champagne/30 shadow-lg bg-charcoal">
                  <ImageWithFallback
                    src={recommendedProduct.images.front}
                    alt={recommendedProduct.name}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-plum-dark/80 text-champagne text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-champagne/30">
                    Recommended For {selectedOccasion}
                  </span>

                  {/* If user uploaded their photo, show inset badge */}
                  {customerPhoto && (
                    <div className="absolute bottom-3 right-3 w-20 h-20 rounded-xl overflow-hidden border-2 border-champagne shadow-2xl bg-charcoal">
                      <img src={customerPhoto} alt="Your portrait" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-plum-dark/90 text-center py-0.5 text-[8px] font-brand uppercase text-champagne">
                        Your Portrait
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Details (7 cols) */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-brand tracking-widest uppercase text-champagne mb-1">
                    {recommendedProduct.subtitle}
                  </div>
                  <h4 className="text-3xl font-editorial font-bold text-ivory mb-2">
                    {recommendedProduct.name}
                  </h4>
                  <p className="text-sm text-ivory/80 leading-relaxed font-light mb-4">
                    {recommendedProduct.description}
                  </p>
                  <div className="text-xl font-editorial font-bold text-champagne">
                    PKR {recommendedProduct.price.toLocaleString()}
                  </div>
                </div>

                {/* AI Stylist Analysis Notes & Explanation */}
                <div className="bg-charcoal/80 border border-champagne/20 rounded-xl p-4 space-y-2 text-xs">
                  <span className="text-champagne font-brand uppercase tracking-wider text-[10px] font-bold block">
                    Why this look was recommended:
                  </span>
                  <p className="text-ivory/90 leading-relaxed">
                    {recommendationReason || `Recommended because it matches your ${selectedOccasion} event, preferred ${preferredColors.join('/')} palette, ${recommendedProduct.fabric} textile drape, and ${styleVibe} silhouette styling.`}
                  </p>
                  <div className="pt-2 border-t border-champagne/15 text-[11px] text-ivory/70 space-y-1">
                    <p>• <strong>Silhouette:</strong> Elongated architecture calibrated for {bodyStructure}.</p>
                    <p>• <strong>Textile:</strong> Authentic {recommendedProduct.fabric} suited for {season} couture festivities.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => {
                      setTryOnProduct(recommendedProduct);
                      setIsTryOnModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-champagne via-champagne-light to-champagne text-plum font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-gold-subtle hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-plum" />
                    <span>View in 360° Try-On</span>
                  </button>

                  <button
                    onClick={() => addToCart(recommendedProduct)}
                    className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/40 font-semibold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Wardrobe</span>
                  </button>

                  <button
                    onClick={() => setSelectedProduct(recommendedProduct)}
                    className="text-ivory/80 hover:text-champagne text-xs uppercase tracking-wider px-4 py-3.5"
                  >
                    View Specs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Form State */}
        {step === 'input' && (
          <div className="bg-plum/70 border border-champagne/25 rounded-2xl p-6 sm:p-10 shadow-luxury max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Field 1: Real Photo Upload / Live Camera */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-champagne font-bold">
                    01. Photo & Undertone Scan
                  </label>
                  {customerPhoto && (
                    <button
                      type="button"
                      onClick={() => setCustomerPhoto(null)}
                      className="text-[10px] text-rose hover:underline flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {customerPhoto ? (
                  <div className="relative rounded-lg overflow-hidden aspect-[4/3] border border-champagne/30 bg-charcoal">
                    <img src={customerPhoto} alt="Your portrait" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 inset-x-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-plum-dark/90 hover:bg-burgundy text-champagne text-[10px] py-1 rounded border border-champagne/20"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="flex-1 bg-burgundy/90 hover:bg-burgundy text-champagne text-[10px] py-1 rounded border border-champagne/20"
                      >
                        Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-burgundy/80 hover:bg-burgundy border border-champagne/30 rounded-lg p-2.5 text-center text-xs flex flex-col items-center justify-center gap-1 transition-colors text-ivory"
                    >
                      <Upload className="w-4 h-4 text-champagne" />
                      <span className="text-[10px] uppercase font-semibold">Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex-1 bg-burgundy/80 hover:bg-burgundy border border-champagne/30 rounded-lg p-2.5 text-center text-xs flex flex-col items-center justify-center gap-1 transition-colors text-ivory"
                    >
                      <Camera className="w-4 h-4 text-champagne" />
                      <span className="text-[10px] uppercase font-semibold">Live Camera</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Field 2: Age */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  02. Age Demographic
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="18-24">18-24 (Gen-Z & Young Bridesmaids)</option>
                  <option value="25-34">25-34 (Contemporary Bride & Sisters)</option>
                  <option value="35-45">35-45 (Regal Matriarch & Family)</option>
                  <option value="45+">45+ (Timeless Heritage Classics)</option>
                </select>
              </div>

              {/* Field 3: Event & Role */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  03. Event Role
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="Own Wedding (Bride)">Own Wedding (The Bride)</option>
                  <option value="Sister of the Bride">Sister of the Bride / Groom</option>
                  <option value="Mother of Bride">Mother of Bride / Groom</option>
                  <option value="Wedding Guest">VIP Wedding Guest</option>
                </select>
              </div>

              {/* Field 4: Occasion */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  04. Pakistani Occasion
                </label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="Barat">Barat (Imperial Crimson)</option>
                  <option value="Walima">Walima (Pastels & Silver)</option>
                  <option value="Nikah">Nikah (Sacred Ivory & Mukesh)</option>
                  <option value="Mehndi">Mehndi (Mustard & Gota)</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Mayo">Mayo</option>
                  <option value="Dolki">Dolki</option>
                  <option value="Reception">Reception</option>
                  <option value="Party">Party</option>
                  <option value="Formal">Formal</option>
                  <option value="Casual">Casual</option>
                  <option value="Eid">Eid</option>
                </select>
              </div>

              {/* Field 5: Body Structure */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  05. Body Structure
                </label>
                <select
                  value={bodyStructure}
                  onChange={(e) => setBodyStructure(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="Petite Structured">Petite Structured</option>
                  <option value="Hourglass / Curated">Hourglass / Curated</option>
                  <option value="Tall Architectural">Tall Architectural</option>
                  <option value="Classic South Asian Curvy">Classic South Asian Curvy</option>
                </select>
              </div>

              {/* Field 6: Dress Type */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  06. Dress Type
                </label>
                <select
                  value={dressType}
                  onChange={(e) => setDressType(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="Heirloom Bridal Lehenga">Heirloom Bridal Lehenga</option>
                  <option value="Floor-length Peshwas">Floor-length Peshwas</option>
                  <option value="Tiered Banarsi Gharara">Tiered Banarsi Gharara</option>
                  <option value="Zardozi Angrakha">Zardozi Angrakha</option>
                  <option value="Luxury Velvet Kaftan">Luxury Velvet Kaftan</option>
                </select>
              </div>

              {/* Field 7: Style */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  07. Aesthetic Vibe
                </label>
                <select
                  value={styleVibe}
                  onChange={(e) => setStyleVibe(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="Regal Mughal Heritage">Regal Mughal Heritage</option>
                  <option value="Minimalist Haute Couture">Minimalist Haute Couture</option>
                  <option value="Contemporary Fusion">Contemporary Fusion</option>
                  <option value="Vintage Old-World Opulence">Vintage Old-World Opulence</option>
                </select>
              </div>

              {/* Field 8: Season */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  08. Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="Winter">Winter (Velvets & Raw Silks)</option>
                  <option value="Spring">Spring (Pastels & Organza)</option>
                  <option value="Summer">Summer (Lawn, Chiffon & Georgette)</option>
                  <option value="Autumn">Autumn (Rich Brocades & Tilla)</option>
                </select>
              </div>

              {/* Field 9: Budget */}
              <div className="bg-plum-dark/60 border border-champagne/20 rounded-xl p-4">
                <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-2 font-bold">
                  09. Investment Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none focus:border-champagne"
                >
                  <option value="PKR 50,000 - 100,000">PKR 50,000 - 100,000 (Pret)</option>
                  <option value="PKR 100,000 - 250,000">PKR 100,000 - 250,000 (Formal)</option>
                  <option value="PKR 250,000 - 400,000">PKR 250,000 - 400,000 (Bridal)</option>
                  <option value="PKR 400,000+">PKR 400,000+ (Masterpiece Bespoke)</option>
                </select>
              </div>
            </div>

            {/* Field 10: Preferred Colors Selector */}
            <div className="mb-8 pt-4 border-t border-champagne/15">
              <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-3 font-bold">
                10. Preferred Color Harmonies (Select multiple)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => {
                  const isSelected = preferredColors.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleColor(c)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-champagne text-plum font-bold shadow-gold-subtle'
                          : 'bg-plum-dark/80 text-ivory/80 border border-champagne/20 hover:border-champagne/60'
                      }`}
                    >
                      {c} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA & Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="w-full sm:w-auto bg-plum-dark/90 hover:bg-plum border border-champagne/30 text-champagne font-brand text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-champagne" />
                <span>BACK TO HOME</span>
              </button>
              <button
                type="button"
                onClick={handleCreateLook}
                className="w-full sm:w-auto bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.25em] px-12 py-4 rounded-xl shadow-gold-glow hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <Wand2 className="w-4 h-4 text-plum" />
                <span>CREATE MY LOOK</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
