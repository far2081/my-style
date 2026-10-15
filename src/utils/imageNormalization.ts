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
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }
        // Case 2: Source is taller than 3:4 (e.g. mobile 9:16 portrait)
        else if (sourceRatio < targetRatio) {
          // Scale to full height to preserve head and feet without cropping
          const drawH = targetHeight;
          const drawW = Math.round(targetHeight * sourceRatio);
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

          // Draw crisp full-body figure centered
          ctx.drawImage(img, 0, 0, w, h, dx, 0, drawW, drawH);
        }
        // Case 3: Source is wider than 3:4 (e.g. 4:3 or landscape webcam)
        else {
          // Check if it's landscape (user centered in frame)
          const sWidth = Math.round(h * targetRatio);
          const sx = Math.round((w - sWidth) / 2);

          if (sx >= 0 && sWidth <= w) {
            // Center 3:4 crop: captures the centered person head-to-toe
            ctx.drawImage(img, sx, 0, sWidth, h, 0, 0, targetWidth, targetHeight);
          } else {
            // Fallback contain
            const drawW = targetWidth;
            const drawH = Math.round(targetWidth / sourceRatio);
            const dy = Math.round((targetHeight - drawH) / 2);
            ctx.drawImage(img, 0, 0, w, h, 0, dy, drawW, drawH);
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
