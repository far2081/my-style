import React, { useState } from 'react';
import { NEXORA_AI_LOGO_BASE64 } from '../../assets/nexoraLogoData';

interface NexoraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  // Primary safe paths:
  // 1. Direct project asset relative path: './assets/nexora_ai_logo.png' (works on Vercel, Vite, local servers)
  // 2. Absolute web root path: '/assets/nexora_ai_logo.png'
  // 3. Guaranteed inline fallback: NEXORA_AI_LOGO_BASE64 (guarantees 100% display in standalone HTML and offline)
  const [srcIndex, setSrcIndex] = useState(0);

  const candidateSources = [
    './assets/nexora_ai_logo.png',
    '/assets/nexora_ai_logo.png',
    NEXORA_AI_LOGO_BASE64,
  ];

  const handleError = () => {
    if (srcIndex < candidateSources.length - 1) {
      setSrcIndex((prev) => prev + 1);
    }
  };

  const heightClasses = {
    sm: 'h-8 sm:h-9 max-w-[140px]',
    md: 'h-11 sm:h-12 max-w-[190px]',
    lg: 'h-16 max-w-[240px]',
    hero: 'h-20 max-w-[300px]',
  }[size];

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={candidateSources[srcIndex]}
        alt="NEXORA AI Logo"
        onError={handleError}
        className={`${heightClasses} w-auto object-contain transition-transform duration-300 hover:scale-105`}
        style={{
          imageRendering: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};
