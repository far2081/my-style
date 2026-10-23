/**
 * Image normalization utility for StyleMira AI Virtual Try-On
 * Standardizes customer images to the recommended 768x1024 (3:4 portrait)
 * coordinate system required by Texel.Moda Try-On Diffusion.
 */

export interface NormalizationOptions {
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
}

export interface FramingAssessment {
  aspectRatio: number;
  framingType: 'full_body' | 'three_quarter' | 'bust_or_closeup';
  isCloseUpOrBust: boolean;
  isLandscape: boolean;
  message: string;
}

/**
 * Assess whether a customer photo contains a full-body standing silhouette
 * or a close-up/bust/landscape framing that may distort Try-On proportions.
 */
export function assessPhotoFraming(width: number, height: number): FramingAssessment {
  const ratio = height / width; // vertical aspect ratio

  if (ratio < 0.95) {
    return {
      aspectRatio: ratio,
      framingType: 'bust_or_closeup',
      isCloseUpOrBust: true,
      isLandscape: true,
      message: 'Landscape photo detected. AI Virtual Try-On will fit the upper neckline & bodice. For full-length floor gowns, please upload a standing vertical photo showing your complete silhouette from head to shoes.',
    };
  } else if (ratio < 1.15) {
    return {
      aspectRatio: ratio,
      framingType: 'bust_or_closeup',
      isCloseUpOrBust: true,
      isLandscape: false,
      message: 'Head & Shoulders Portrait detected. AI Virtual Try-On will fit the neckline, collar, and bodice. For floor-length skirt and footwear draping, upload a full-length photo or select a full-body atelier avatar.',
    };
  } else if (ratio < 1.28) {
    return {
      aspectRatio: ratio,
      framingType: 'three_quarter',
      isCloseUpOrBust: false,
      isLandscape: false,
      message: 'Three-quarter portrait detected. Garment will fit your visible silhouette down to hemline; for full footwear visibility, include head-to-shoes height.',
    };
  } else {
    return {
      aspectRatio: ratio,
      framingType: 'full_body',
      isCloseUpOrBust: false,
      isLandscape: false,
      message: 'Full-length vertical standing silhouette detected. Complete head-to-toe outfit draping active.',
    };
  }
}

export async function normalizeTo3x4Portrait(
  imageSource: string,
  options: NormalizationOptions = {}
): Promise<string> {
  const targetWidth = options.targetWidth || 768;
  const targetHeight = options.targetHeight || 1024;
  const quality = options.quality || 0.95;
  const targetRatio = targetWidth / targetHeight; // 0.75

  if (!imageSource || typeof imageSource !== 'string') {
    return imageSource;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width || 640;
        const h = img.naturalHeight || img.height || 480;
        const sourceRatio = w / h;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageSource);
          return;
        }

        // Fill background with neutral tone
        ctx.fillStyle = '#1A1118';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Case 1: Source is roughly 3:4 portrait (within 5% tolerance)
        // Draw directly to fill canvas — ZERO artificial black bar padding so feet and hemlines are 100% visible
        if (Math.abs(sourceRatio - targetRatio) < 0.05) {
          ctx.drawImage(img, 0, 0, w, h, 0, 0, targetWidth, targetHeight);
        }
        // Case 2: Source is taller than 3:4 (e.g. mobile 9:16 portrait)
        // Span 100% of height (y=0 to targetHeight) so head and shoes are never clipped
        else if (sourceRatio < targetRatio) {
          const drawH = targetHeight;
          const drawW = Math.round(targetHeight * sourceRatio);
          const dx = Math.round((targetWidth - drawW) / 2);

          // Subtle ambient side background so neural mask sees smooth transition instead of stark line
          try {
            ctx.save();
            ctx.filter = 'blur(20px)';
            ctx.drawImage(img, -20, -20, targetWidth + 40, targetHeight + 40);
            ctx.restore();
          } catch {
            // fallback
          }

          ctx.fillStyle = 'rgba(26, 17, 24, 0.4)';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Draw crisp full-body figure spanning 100% of canvas height
          ctx.drawImage(img, 0, 0, w, h, dx, 0, drawW, drawH);
        }
        // Case 3: Source is wider than 3:4 (e.g. square, 2:3 DSLR, 4:3, or landscape)
        else {
          const vertRatio = h / w;
          // If vertical ratio is near portrait (>= 1.15, e.g. 2:3 DSLR), center crop horizontally while preserving 100% of height
          if (vertRatio >= 1.15) {
            const sWidth = Math.round(h * targetRatio);
            const sx = Math.round((w - sWidth) / 2);
            if (sx >= 0 && sWidth <= w) {
              ctx.drawImage(img, sx, 0, sWidth, h, 0, 0, targetWidth, targetHeight);
            } else {
              const drawW = targetWidth;
              const drawH = Math.round(targetWidth / sourceRatio);
              const dy = Math.round((targetHeight - drawH) / 2);
              ctx.drawImage(img, 0, 0, w, h, 0, dy, drawW, drawH);
            }
          } else {
            // Square or landscape: Ambient backdrop with full-image containment
            try {
              ctx.save();
              ctx.filter = 'blur(25px)';
              ctx.drawImage(img, -20, -20, targetWidth + 40, targetHeight + 40);
              ctx.restore();
            } catch {
              // fallback
            }

            ctx.fillStyle = 'rgba(26, 17, 24, 0.45)';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Fit height or width cleanly
            const drawH = Math.round(targetHeight * 0.92);
            const drawW = Math.round(drawH * sourceRatio);
            if (drawW <= targetWidth) {
              const dx = Math.round((targetWidth - drawW) / 2);
              const dy = Math.round((targetHeight - drawH) / 2);
              ctx.drawImage(img, 0, 0, w, h, dx, dy, drawW, drawH);
            } else {
              const fitW = Math.round(targetWidth * 0.94);
              const fitH = Math.round(fitW / sourceRatio);
              const dx = Math.round((targetWidth - fitW) / 2);
              const dy = Math.round((targetHeight - fitH) / 2);
              ctx.drawImage(img, 0, 0, w, h, dx, dy, fitW, fitH);
            }
          }
        }

        const normalizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log('[ImageNormalization] Photo normalized to 768x1024 3:4 portrait canvas.');
        resolve(normalizedDataUrl);
      } catch (err) {
        console.warn('[ImageNormalization] Error during canvas normalization, using original:', err);
        resolve(imageSource);
      }
    };

    img.onerror = (err) => {
      console.warn('[ImageNormalization] Failed to load image for normalization:', err);
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}
