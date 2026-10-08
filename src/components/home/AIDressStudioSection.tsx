import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AI_DESIGNS_DATA } from '../../data/aiDesigns';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Folder, Sparkles, Bookmark, Edit3, Trash2, Plus, Heart, Wand2, AlertCircle, Shirt } from 'lucide-react';
import { AIDressDesign } from '../../types';
import { aiProviders } from '../../services/aiProvider';

export const AIDressStudioSection: React.FC = () => {
  const { setTryOnProduct } = useApp();
  const [activeFolder, setActiveFolder] = useState<string>('My Designs');
  const [designs, setDesigns] = useState<AIDressDesign[]>(AI_DESIGNS_DATA);
  const [newPrompt, setNewPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const folders = [
    'My Designs',
    'Bridal',
    'Mehndi',
    'Barat',
    'Walima',
    'Nikah',
    'Party',
    'Formal',
    'Casual',
    'Eid',
    'Summer',
    'Winter',
    'Favorites',
  ] as const;

  const filteredDesigns = designs.filter((d) => {
    if (activeFolder === 'Favorites') return d.isFavorite;
    if (activeFolder === 'My Designs') return true;
    return d.folder.toLowerCase() === activeFolder.toLowerCase();
  });

  const handleDelete = (id: string) => {
    setDesigns(designs.filter((d) => d.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setDesigns(
      designs.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const handleGenerateCustomDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) {
      setGenerationError('Please enter a description for your bespoke concept design.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const folderCat = activeFolder === 'Favorites' || activeFolder === 'My Designs' ? 'Bridal' : activeFolder;
    const res = await aiProviders.dressGen.generateDressConcept({
      prompt: newPrompt,
      folderCategory: folderCat,
      fabricPreference: 'Authentic Pure Katan Silk & Tissue Organza',
    });

    setIsGenerating(false);

    if (res.status === 'failed' || !res.result) {
      setGenerationError(res.error || 'Failed to generate design concept.');
      return;
    }

    const newDesign: AIDressDesign = {
      id: res.result.conceptId,
      name: res.result.conceptName,
      folder: (activeFolder === 'Favorites' ? 'My Designs' : activeFolder) as any,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      image: res.result.conceptImageUrl,
      prompt: newPrompt,
      fabric: res.result.fabricBreakdown,
      colorPalette: res.result.colorPalette,
      isFavorite: true,
      isAiConcept: true,
    };

    setDesigns([newDesign, ...designs]);
    setNewPrompt('');
  };

  return (
    <section className="py-24 bg-ivory text-plum relative overflow-hidden" id="dress-studio">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum/10 text-plum border border-plum/20 text-[10px] font-brand uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-champagne-dark" />
            <span>Generative Couture Studio</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-plum tracking-tight uppercase mb-4">
            AI DRESS STUDIO
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-mauve-deep max-w-2xl mx-auto leading-relaxed font-light">
            Generate, catalog, and archive bespoke Pakistani silhouettes created with StyleMira generative design engine.
          </p>
        </div>

        {/* Generative Prompt Bar */}
        <div className="bg-ivory-light border border-plum/15 rounded-2xl p-6 shadow-sm mb-12 max-w-4xl mx-auto">
          <form onSubmit={handleGenerateCustomDesign} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => {
                setNewPrompt(e.target.value);
                if (generationError) setGenerationError(null);
              }}
              placeholder="Describe your dream dress... e.g. Midnight plum peshwas with French tilla zardozi neckline and organza dupatta"
              className="flex-1 bg-ivory border border-plum/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-plum placeholder-plum/40 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-plum hover:bg-burgundy text-champagne font-brand text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 text-champagne" />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Design'}</span>
            </button>
          </form>

          {generationError && (
            <div className="mt-3 flex items-center gap-2 text-rose text-xs bg-rose/10 border border-rose/30 px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{generationError}</span>
            </div>
          )}
        </div>

        {/* 13 Visual Folders Strip (Specification: My Designs, Bridal, Mehndi, Barat, Walima, Nikah, Party, Formal, Casual, Eid, Summer, Winter, Favorites) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {folders.map((folder) => {
            const isActive = activeFolder === folder;
            const count = designs.filter((d) =>
              folder === 'Favorites'
                ? d.isFavorite
                : folder === 'My Designs'
                ? true
                : d.folder.toLowerCase() === folder.toLowerCase()
            ).length;

            return (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-brand uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-plum text-champagne font-bold shadow-md'
                    : 'bg-ivory-warm text-plum/70 hover:bg-plum/10 hover:text-plum border border-plum/10'
                }`}
              >
                <Folder className={`w-3.5 h-3.5 ${isActive ? 'text-champagne' : 'text-mauve'}`} />
                <span>{folder}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-burgundy text-champagne' : 'bg-plum/10 text-plum'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Designs Cards Grid */}
        {/* Specification: Each design card: Image, Name, Date, Save, Edit, Delete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              className="group bg-ivory-light rounded-xl overflow-hidden border border-plum/15 hover:border-champagne/80 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-plum-dark">
                <ImageWithFallback
                  src={design.image}
                  alt={design.name}
                  fallbackCategory={design.folder}
                  aspectRatio="aspect-[3/4]"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  <span className="bg-burgundy/90 text-champagne text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-champagne/40 shadow-sm backdrop-blur-sm">
                    AI CONCEPT
                  </span>
                  <span className="bg-plum-dark/85 text-champagne-light text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-champagne/20 backdrop-blur-sm">
                    {design.folder}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleFavorite(design.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                    design.isFavorite
                      ? 'bg-rose text-white shadow-sm'
                      : 'bg-plum/60 text-ivory/80 hover:text-champagne'
                  }`}
                  title={design.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${design.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Card Details: Name, Date, Save, Edit, Delete */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-mauve font-mono block">
                      Created: {design.date}
                    </span>
                    <span className="text-[9px] text-champagne-dark font-brand uppercase tracking-wider bg-champagne/10 px-1.5 py-0.5 rounded">
                      Generative
                    </span>
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-plum group-hover:text-burgundy transition-colors mt-0.5 line-clamp-1">
                    {design.name}
                  </h4>
                  <p className="text-[11px] text-mauve-deep line-clamp-2 mt-1 leading-relaxed">
                    "{design.prompt}"
                  </p>
                </div>

                {/* Actions: Save, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-plum/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Save Button */}
                    <button
                      onClick={() => handleToggleFavorite(design.id)}
                      className="p-1.5 rounded-lg bg-plum/5 hover:bg-plum/15 text-plum text-xs flex items-center gap-1 transition-colors"
                      title="Save Design"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-champagne-dark" />
                      <span className="text-[10px] font-semibold uppercase">Save</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setNewPrompt(design.prompt);
                        window.scrollTo({ top: document.getElementById('dress-studio')?.offsetTop || 0, behavior: 'smooth' });
                      }}
                      className="p-1.5 rounded-lg bg-plum/5 hover:bg-plum/15 text-plum text-xs flex items-center gap-1 transition-colors"
                      title="Remix Prompt"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-mauve" />
                      <span className="text-[10px] font-semibold uppercase">Remix</span>
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(design.id)}
                    className="p-1.5 rounded-lg text-rose hover:bg-rose/10 transition-colors"
                    title="Delete Design"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
