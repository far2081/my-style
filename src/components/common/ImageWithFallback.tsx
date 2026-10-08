import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCategory?: string;
  className?: string;
  aspectRatio?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackCategory = 'Couture',
  className = '',
  aspectRatio = 'aspect-[3/4]',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  if (hasError || !src) {
    return (
      <div
        className={`relative ${aspectRatio} w-full overflow-hidden rounded-md bg-gradient-to-br from-plum-dark via-burgundy to-charcoal-dark flex flex-col items-center justify-center p-6 text-center border border-champagne/20 ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-champagne/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-12 h-12 rounded-full border border-champagne/30 bg-plum/60 flex items-center justify-center mb-3 shadow-gold-subtle">
          <Sparkles className="w-5 h-5 text-champagne animate-pulse" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-champagne font-brand font-medium">
          STYLEMIRA AI
        </span>
        <span className="text-sm font-cormorant italic text-ivory/90 mt-1">
          {alt || fallbackCategory}
        </span>
        <span className="text-[10px] text-ivory/50 mt-1 uppercase tracking-wider">
          Exclusive Haute Couture
        </span>

        {/* Retry button as required by Section 15 */}
        <button
          onClick={handleRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum/80 hover:bg-burgundy text-[10px] text-champagne border border-champagne/30 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Image</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} w-full overflow-hidden bg-plum-dark/40 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-plum-light/30 animate-pulse flex items-center justify-center z-10">
          <span className="text-[10px] tracking-widest uppercase text-champagne/60 font-brand">
            Curating...
          </span>
        </div>
      )}
      <img
        key={`${src}-${retryKey}`}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...rest}
      />
    </div>
  );
};
