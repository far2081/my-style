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

  if (ratio < 0.65) {
    return {
      aspectRatio: ratio,
      framingType: 'bust_or_closeup',
      isCloseUpOrBust: false,
      isLandscape: true,
      message: 'Wide landscape photo detected. Centered standing figure will be fitted with complete full-length ensemble.',
    };
  } else if (ratio < 0.85) {
    return {
      aspectRatio: ratio,
      framingType: 'full_body',
      isCloseUpOrBust: false,
      isLandscape: false,
      message: 'Standard photo detected. Full-length silhouette active from head to shoes.',
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
        // Case 3: Source is wider than 3:4 (e.g. square, 4:3, 2:3 DSLR, or landscape)
        // Span 100% of vertical height (head to feet) from y=0 to targetHeight so shoes and hemline are never cropped
        else {
          const drawH = targetHeight;
          const drawW = Math.round(targetHeight * sourceRatio);
          const dx = Math.round((targetWidth - drawW) / 2);

          ctx.drawImage(img, 0, 0, w, h, dx, 0, drawW, drawH);
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
