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
      message: 'Landscape photo detected. For authentic full-length outfit draping, please upload or capture a vertical portrait showing your complete silhouette from head to shoes.',
    };
  } else if (ratio < 1.20) {
    return {
      aspectRatio: ratio,
      framingType: 'bust_or_closeup',
      isCloseUpOrBust: true,
      isLandscape: false,
      message: 'Square or bust-level portrait detected. The AI Try-On engine requires your full standing silhouette (head to shoes) to drape floor-length lehengas and gowns without neck or proportion distortion.',
    };
  } else if (ratio < 1.40) {
    return {
      aspectRatio: ratio,
      framingType: 'three_quarter',
      isCloseUpOrBust: false,
      isLandscape: false,
      message: 'Three-quarter portrait detected. Garment will fit your visible torso and knees; for floor-length gowns, include your full standing height.',
    };
  } else {
    return {
      aspectRatio: ratio,
      framingType: 'full_body',
      isCloseUpOrBust: false,
      isLandscape: false,
      message: 'Optimal full-length standing portrait detected.',
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

        // Fill background with dark studio tone as fallback
        ctx.fillStyle = '#1A1118';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Case 1: Source is roughly 3:4 portrait (within 4% tolerance)
        if (Math.abs(sourceRatio - targetRatio) < 0.04) {
          // Slight vertical padding (3%) for headroom and foot clearance
          const vPad = Math.round(targetHeight * 0.03);
          const drawH = targetHeight - (vPad * 2);
          const drawW = Math.round(drawH * sourceRatio);
          const dx = Math.round((targetWidth - drawW) / 2);
          ctx.drawImage(img, 0, 0, w, h, dx, vPad, drawW, drawH);
        }
        // Case 2: Source is taller than 3:4 (e.g. mobile 9:16 portrait)
        else if (sourceRatio < targetRatio) {
          // Scale with 3.5% vertical headroom & floor clearance so hair and hemline aren't clipped by edge convolutions
          const vPad = Math.round(targetHeight * 0.035);
          const drawH = targetHeight - (vPad * 2);
          const drawW = Math.round(drawH * sourceRatio);
          const dx = Math.round((targetWidth - drawW) / 2);

          // Draw blurred ambient background to prevent sharp edge artifacts for AI mask
          try {
            ctx.save();
            ctx.filter = 'blur(20px)';
            ctx.drawImage(img, -20, -20, targetWidth + 40, targetHeight + 40);
            ctx.restore();
          } catch {
            // Some browsers or tainted canvases might throw on filter
          }

          // Draw dark translucent overlay on background padding
          ctx.fillStyle = 'rgba(26, 17, 24, 0.4)';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Draw crisp full-body figure centered with headroom & feet clearance
          ctx.drawImage(img, 0, 0, w, h, dx, vPad, drawW, drawH);
        }
        // Case 3: Source is wider than 3:4 (e.g. square, 4:3, or landscape)
        else {
          // If square or landscape (h/w < 1.15), stretching a face crop to fill full height causes neck elongation.
          // Non-destructive ingestion: contain entire image with ambient blurred background.
          const vertRatio = h / w;
          if (vertRatio < 1.15) {
            // Ambient backdrop
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

            // Fit width with headroom
            const drawW = Math.round(targetWidth * 0.94);
            const drawH = Math.round(drawW / sourceRatio);
            const dx = Math.round((targetWidth - drawW) / 2);
            const dy = Math.max(10, Math.round((targetHeight - drawH) / 2));
            ctx.drawImage(img, 0, 0, w, h, dx, dy, drawW, drawH);
          } else {
            // Standing portrait slightly wider than 3:4 (e.g. 2:3 or 3:4.5)
            // Center crop with subtle margin
            const sWidth = Math.round(h * targetRatio);
            const sx = Math.round((w - sWidth) / 2);

            if (sx >= 0 && sWidth <= w) {
              ctx.drawImage(img, sx, 0, sWidth, h, 0, 0, targetWidth, targetHeight);
            } else {
              // Contain
              const drawW = targetWidth;
              const drawH = Math.round(targetWidth / sourceRatio);
              const dy = Math.round((targetHeight - drawH) / 2);
              ctx.drawImage(img, 0, 0, w, h, 0, dy, drawW, drawH);
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
