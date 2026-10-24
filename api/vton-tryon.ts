import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// RapidAPI Try-On Diffusion Endpoints
const VTON_URL_ENDPOINT = 'https://try-on-diffusion.p.rapidapi.com/try-on-url';
const VTON_FILE_ENDPOINT = 'https://try-on-diffusion.p.rapidapi.com/try-on-file';
const EXPECTED_HOST = 'try-on-diffusion.p.rapidapi.com';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60,
};

// Supabase client helper for optional server-side archival
function getSupabaseServerClient() {
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://dlfkbpsfdhciwwjovyjr.supabase.co';

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'sb_publishable_7jjKyJAst84Pt5WYg7Mijw_kXhSNlT1';

  return createClient(supabaseUrl, supabaseKey);
}

// Helper: Resolves clothing image URL into an absolute, publicly accessible HTTPS URL
function resolveAccessibleClothingUrl(url: string, req: VercelRequest): string {
  let cleaned = (url || '').trim();
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    // If it's a localhost URL, rewrite to GitHub raw repository CDN
    if (cleaned.includes('localhost') || cleaned.includes('127.0.0.1')) {
      const match = cleaned.match(/\/images\/.+$/);
      if (match) {
        return `https://raw.githubusercontent.com/far2081/my-style/main/public${match[0]}`;
      }
    }
    return cleaned;
  }

  // Relative path starting with /
  if (cleaned.startsWith('/')) {
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const proto = (req.headers['x-forwarded-proto'] || 'https') as string;
      return `${proto}://${host}${cleaned}`;
    }
    // Fallback to GitHub raw CDN so external AI provider can always access it
    return `https://raw.githubusercontent.com/far2081/my-style/main/public${cleaned}`;
  }

  return cleaned;
}

// Helper: Resolves avatar URL if relative path
function resolveAccessibleAvatarUrl(url: string, req: VercelRequest): string {
  let cleaned = (url || '').trim();
  if (cleaned.startsWith('/')) {
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const proto = (req.headers['x-forwarded-proto'] || 'https') as string;
      return `${proto}://${host}${cleaned}`;
    }
    return `https://raw.githubusercontent.com/far2081/my-style/main/public${cleaned}`;
  }
  return cleaned;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Verify Server-Side Environment Variables
  const apiKey =
    process.env.VTON_API_KEY ||
    process.env.VTON_D_API_KEY ||
    process.env.VTOND_API_KEY ||
    process.env.RAPIDAPI_KEY ||
    process.env.RAPID_API_KEY;

  let apiHost =
    process.env.VTON_API_HOST ||
    process.env.VTON_D_API_HOST ||
    EXPECTED_HOST;

  if (apiHost.trim().toLowerCase() !== EXPECTED_HOST) {
    apiHost = EXPECTED_HOST;
  }

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    console.error('[VTON Error] VTON API key is not configured in Vercel environment variables.');
    return res.status(503).json({
      error: 'Virtual Try-On is not configured.',
      detail: 'VTON_API_KEY / VTON_D_API_KEY environment variable is missing in Vercel.',
      configured: false,
    });
  }

  // 2. Extract Request Payload
  const {
    avatar_image_url,
    face_image_url,
    body_image_url,
    body_structure,
    clothing_image_url,
    productId,
    userId,
    product_name,
    dress_type,
    category,
    color,
    fabric,
    description,
    is_portrait_only,
    photo_type,
  } = req.body as {
    avatar_image_url?: string;
    face_image_url?: string;
    body_image_url?: string;
    body_structure?: string;
    clothing_image_url?: string;
    productId?: string;
    userId?: string;
    product_name?: string;
    dressType?: string;
    dress_type?: string;
    category?: string;
    color?: string;
    fabric?: string;
    description?: string;
    is_portrait_only?: boolean;
    photo_type?: 'fullbody' | 'portrait';
  };

  // If customer uploaded both a face portrait and a full-body photo, choose full body as garment avatar
  const primaryAvatarUrl = body_image_url && body_image_url.trim() ? body_image_url : avatar_image_url;

  const isPortraitMode = Boolean(is_portrait_only || photo_type === 'portrait');

  const cleanName = (product_name || '').trim();
  const cleanType = (dress_type || category || 'formal dress').trim();
  const cleanColor = (color || '').trim();
  const cleanFabric = (fabric || '').trim();
  const cleanDesc = (description || '').slice(0, 150).trim();

  // Detect bridal look or head-covering dupatta in product metadata
  const isBridalOrDupatta =
    cleanType.toLowerCase().includes('bridal') ||
    cleanType.toLowerCase().includes('lehenga') ||
    cleanType.toLowerCase().includes('gharara') ||
    cleanType.toLowerCase().includes('peshwas') ||
    cleanType.toLowerCase().includes('anarkali') ||
    cleanDesc.toLowerCase().includes('dupatta') ||
    cleanDesc.toLowerCase().includes('bridal') ||
    cleanName.toLowerCase().includes('bridal') ||
    cleanName.toLowerCase().includes('shahzadi') ||
    cleanName.toLowerCase().includes('lehenga') ||
    cleanName.toLowerCase().includes('dupatta');

  // Dynamic prompt conditioning based on whether customer submitted a full-length silhouette or head/bust portrait
  const clothingPrompt = isPortraitMode
    ? [
        `an authentic Pakistani ${cleanType}`,
        cleanName ? `StyleMira ${cleanName}` : '',
        cleanColor ? `${cleanColor} color` : '',
        cleanFabric ? `${cleanFabric} fabric` : '',
        'natural proportionate slender human neck, anatomically correct head-to-neck alignment, natural shoulders',
        isBridalOrDupatta
          ? 'wearing matching sheer embroidered dupatta draped over the head framing the face, headpiece and veil properly placed around head and shoulders'
          : '',
        'detailed embroidered neckline, embellished collar, and tailored bodice',
        cleanDesc ? cleanDesc : '',
      ]
        .filter(Boolean)
        .join(', ')
    : [
        `an authentic complete full-length Pakistani ${cleanType}`,
        cleanName ? `StyleMira ${cleanName}` : '',
        cleanColor ? `${cleanColor} color` : '',
        cleanFabric ? `${cleanFabric} fabric` : '',
        'natural proportionate slender human neck, anatomically correct head-to-neck alignment, natural shoulders',
        isBridalOrDupatta
          ? 'wearing matching sheer embroidered dupatta draped over the head framing the face, traditional embellished headpiece and veil gracefully falling over shoulders'
          : '',
        'embroidered bodice, tailored waist, long sleeves, full flared floor-length skirt extending all the way down to the hemline, feet and shoes fully visible on floor',
        body_structure ? `tailored for a ${body_structure} silhouette` : '',
        cleanDesc ? cleanDesc : '',
      ]
        .filter(Boolean)
        .join(', ');

  const avatarPrompt = isPortraitMode
    ? (isBridalOrDupatta
        ? 'a clear frontal portrait of a woman wearing a matching sheer embroidered bridal dupatta draped over her head framing her face, authentic jewelry and headpiece, natural human anatomy, realistic neck proportions, head and shoulders clearly visible'
        : 'a clear frontal portrait of a woman, natural human anatomy, realistic neck proportions, head and shoulders clearly visible, natural posture')
    : (isBridalOrDupatta
        ? 'a complete full-body frontal portrait of a woman standing straight, wearing matching sheer embroidered bridal dupatta draped over her head framing her face, headpiece visible, natural human anatomy, realistic neck, complete standing body from head to feet, full flared skirt hemline and shoes completely visible on floor'
        : 'a complete full-body frontal portrait of a woman standing straight, head, natural neck, full body, knees, legs, and feet completely visible from top to bottom, natural proportions');
  const avatarSex = 'female';

  const isFullLengthGarment =
    !category ||
    category.toLowerCase() === 'dresses' ||
    category.toLowerCase() === 'bridal' ||
    category.toLowerCase() === 'barat' ||
    category.toLowerCase() === 'walima' ||
    category.toLowerCase() === 'nikah' ||
    category.toLowerCase() === 'formal' ||
    category.toLowerCase() === 'festive' ||
    cleanType.toLowerCase().includes('lehenga') ||
    cleanType.toLowerCase().includes('gharara') ||
    cleanType.toLowerCase().includes('peshwas') ||
    cleanType.toLowerCase().includes('anarkali') ||
    cleanType.toLowerCase().includes('gown') ||
    cleanType.toLowerCase().includes('maxi') ||
    cleanType.toLowerCase().includes('saree') ||
    cleanType.toLowerCase().includes('bridal') ||
    cleanType.toLowerCase().includes('dress');

  const garmentCategory = isFullLengthGarment ? 'dresses' : (isPortraitMode ? 'upper_body' : 'dresses');

  // Stage 1 Diagnostic: Portrait, Body, Structure, and Garment Received
  const isBase64Avatar = Boolean(primaryAvatarUrl && primaryAvatarUrl.startsWith('data:image/'));
  console.log('[VTON Diagnostic Stage 1 - Request Received]', {
    hasAvatar: Boolean(primaryAvatarUrl && primaryAvatarUrl.trim()),
    isAvatarBase64: isBase64Avatar,
    avatarLength: primaryAvatarUrl ? primaryAvatarUrl.length : 0,
    hasFacePortrait: Boolean(face_image_url && face_image_url.trim()),
    hasBodyPhoto: Boolean(body_image_url && body_image_url.trim()),
    bodyStructure: body_structure || 'unspecified',
    hasClothing: Boolean(clothing_image_url && clothing_image_url.trim()),
    clothingUrlPreview: clothing_image_url ? clothing_image_url.slice(0, 60) + '...' : 'none',
    productId: productId || 'unspecified',
    clothingPrompt,
    avatarPrompt,
    avatarSex,
    category: garmentCategory,
  });

  if (!primaryAvatarUrl || !primaryAvatarUrl.trim()) {
    return res.status(400).json({
      error: 'Customer portrait photo is required for Virtual Try-On.',
    });
  }

  if (!clothing_image_url || !clothing_image_url.trim()) {
    return res.status(400).json({
      error: 'Product clothing image URL is required from the StyleMira catalog.',
    });
  }

  const rawAvatarUrl = primaryAvatarUrl.trim();
  const accessibleClothingUrl = resolveAccessibleClothingUrl(clothing_image_url, req);

  // Stage 2 Diagnostic: Garment URL Resolved
  console.log('[VTON Diagnostic Stage 2 - Garment Resolved]', {
    clothingUrl: accessibleClothingUrl.slice(0, 80) + '...',
  });

  try {
    let rapidResponse: Response;

    // Check if customer portrait is Base64 data (uploaded or captured via webcam)
    if (isBase64Avatar) {
      const match = rawAvatarUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({
          error: 'Invalid customer photo format. Supported formats are JPEG, PNG, or WEBP.',
        });
      }

      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' || rawExt === 'jpg' ? 'jpg' : rawExt === 'png' ? 'png' : 'webp';
      const base64Data = match[2];
      const avatarBuffer = Buffer.from(base64Data, 'base64');
      const avatarMime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      if (avatarBuffer.length < 500) {
        return res.status(400).json({
          error: 'Customer photo is corrupted or too small. Minimum resolution is 256×256 pixels.',
        });
      }
      if (avatarBuffer.length > 12 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Customer photo size exceeds the 12 MB limit.',
        });
      }

      // Fetch the clothing image binary bytes
      console.log('[VTON Diagnostic Stage 3 - Fetching Garment Binary]');
      let clothingRes: Response;
      try {
        clothingRes = await fetch(accessibleClothingUrl, { signal: AbortSignal.timeout(8000) });
      } catch (clothErr: any) {
        // Fallback to GitHub raw CDN if domain host fetch failed
        const fallbackUrl = `https://raw.githubusercontent.com/far2081/my-style/main/public${clothing_image_url.startsWith('/') ? clothing_image_url : '/' + clothing_image_url}`;
        console.warn('[VTON Notice] Primary garment fetch timed out/failed, retrying with raw CDN:', fallbackUrl);
        clothingRes = await fetch(fallbackUrl, { signal: AbortSignal.timeout(8000) });
      }

      if (!clothingRes.ok) {
        throw new Error(`Failed to retrieve garment image: HTTP ${clothingRes.status}`);
      }
      const clothingArrayBuffer = await clothingRes.arrayBuffer();
      const clothingBuffer = Buffer.from(clothingArrayBuffer);
      const clothingMime = clothingRes.headers.get('content-type') || 'image/jpeg';

      console.log('[VTON Diagnostic Stage 4 - Portrait & Garment Prepared for Direct Multipart File Upload]', {
        avatarBytes: avatarBuffer.length,
        avatarMime,
        clothingBytes: clothingBuffer.length,
        clothingMime,
        targetEndpoint: VTON_FILE_ENDPOINT,
      });

      // Construct multipart form data for /try-on-file endpoint
      const fileFormData = new FormData();
      fileFormData.append('avatar_image', new Blob([avatarBuffer], { type: avatarMime }), `avatar.${ext}`);
      fileFormData.append('clothing_image', new Blob([clothingBuffer], { type: clothingMime }), 'garment.jpg');
      fileFormData.append('clothing_prompt', clothingPrompt);
      fileFormData.append('avatar_prompt', avatarPrompt);
      fileFormData.append('avatar_sex', avatarSex);
      fileFormData.append('category', garmentCategory);

      console.log('[VTON Diagnostic Stage 5 - Calling Try-On Diffusion /try-on-file]', {
        clothingPrompt,
        avatarPrompt,
        avatarSex,
        category: garmentCategory,
      });

      const rapidStartTime = Date.now();
      rapidResponse = await fetch(VTON_FILE_ENDPOINT, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': apiKey.trim(),
          'X-RapidAPI-Host': apiHost.trim(),
        },
        signal: AbortSignal.timeout(50000), // 50s timeout protects before Vercel 60s hard kill
        body: fileFormData,
      });
      const rapidElapsedMs = Date.now() - rapidStartTime;
    } else {
      // Avatar is a web URL (e.g. sample atelier model)
      const accessibleAvatarUrl = resolveAccessibleAvatarUrl(rawAvatarUrl, req);

      console.log('[VTON Diagnostic Stage 4 - URL Mode Prepared]', {
        avatarUrlPreview: accessibleAvatarUrl.slice(0, 70) + '...',
        clothingUrlPreview: accessibleClothingUrl.slice(0, 70) + '...',
        targetEndpoint: VTON_URL_ENDPOINT,
      });

      const urlFormData = new FormData();
      urlFormData.append('avatar_image_url', accessibleAvatarUrl);
      urlFormData.append('clothing_image_url', accessibleClothingUrl);
      urlFormData.append('clothing_prompt', clothingPrompt);
      urlFormData.append('avatar_prompt', avatarPrompt);
      urlFormData.append('avatar_sex', avatarSex);
      urlFormData.append('category', garmentCategory);

      console.log('[VTON Diagnostic Stage 5 - Calling Try-On Diffusion /try-on-url]', {
        clothingPrompt,
        avatarPrompt,
        avatarSex,
        category: garmentCategory,
      });

      const rapidStartTime = Date.now();
      rapidResponse = await fetch(VTON_URL_ENDPOINT, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': apiKey.trim(),
          'X-RapidAPI-Host': apiHost.trim(),
        },
        signal: AbortSignal.timeout(50000),
        body: urlFormData,
      });
      let rapidElapsedMs = Date.now() - rapidStartTime;

      // If provider returned 415 or 400 with "JSON", retry with application/json
      if (!rapidResponse.ok && (rapidResponse.status === 415 || rapidResponse.status === 400)) {
        const peekText = await rapidResponse.clone().text().catch(() => '');
        if (peekText.toLowerCase().includes('json') || rapidResponse.status === 415) {
          console.log('[VTON Notice] Retrying Try-On Diffusion with JSON payload');
          rapidResponse = await fetch(VTON_URL_ENDPOINT, {
            method: 'POST',
            headers: {
              'X-RapidAPI-Key': apiKey.trim(),
              'X-RapidAPI-Host': apiHost.trim(),
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(45000),
            body: JSON.stringify({
              avatar_image_url: accessibleAvatarUrl,
              clothing_image_url: accessibleClothingUrl,
              clothing_prompt: clothingPrompt,
              avatar_prompt: avatarPrompt,
              avatar_sex: avatarSex,
              category: garmentCategory,
            }),
          });
        }
      }
    }

    // Stage 6 Diagnostic: API Response Status
    console.log('[VTON Diagnostic Stage 6 - Provider Responded]', {
      status: rapidResponse.status,
      statusText: rapidResponse.statusText,
      contentType: rapidResponse.headers.get('content-type') || 'unknown',
    });

    // Handle Provider Errors
    if (!rapidResponse.ok) {
      const status = rapidResponse.status;
      const errorText = await rapidResponse.text().catch(() => '');
      console.error(`[VTON Provider Failure] HTTP ${status}:`, errorText.slice(0, 300));

      if (status === 400) {
        return res.status(400).json({
          error: 'Invalid images provided. Ensure the customer photo is a clear, front-facing portrait (min 256×256 pixels).',
          detail: errorText.slice(0, 300),
          status: 400,
        });
      }
      if (status === 403) {
        return res.status(403).json({
          error: 'Virtual Try-On authentication issue. Please verify RapidAPI credentials in Vercel.',
          detail: errorText.slice(0, 300),
          status: 403,
        });
      }
      if (status === 422) {
        return res.status(422).json({
          error: 'Unprocessable image: could not detect human posture or garment boundaries in image.',
          detail: errorText.slice(0, 300),
          status: 422,
        });
      }
      if (status === 429) {
        return res.status(429).json({
          error: 'Virtual Try-On request limit reached. Please try again shortly.',
          detail: errorText.slice(0, 300),
          status: 429,
        });
      }
      if (status === 504 || status === 502 || status === 503) {
        return res.status(504).json({
          error: 'The AI generation server took too long to synthesize the try-on. Please try again with a smaller photo.',
          detail: errorText.slice(0, 300),
          status: 504,
        });
      }

      return res.status(status).json({
        error: `Virtual Try-On provider returned HTTP ${status}.`,
        detail: errorText.slice(0, 300),
        status,
      });
    }

    // Process Successful Response (Binary Image)
    const contentType = rapidResponse.headers.get('content-type') || '';
    let resultBuffer: Buffer;
    let resultMime = 'image/jpeg';

    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      const arrayBuffer = await rapidResponse.arrayBuffer();
      resultBuffer = Buffer.from(arrayBuffer);
      if (contentType.includes('image/')) {
        resultMime = contentType.split(';')[0].trim();
      }
    } else {
      const responseText = await rapidResponse.text();
      try {
        const json = JSON.parse(responseText);
        const imgUrl = json?.image_url || json?.result_url || json?.url || json?.output;
        if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
          const imgFetch = await fetch(imgUrl);
          const arrayBuffer = await imgFetch.arrayBuffer();
          resultBuffer = Buffer.from(arrayBuffer);
        } else if (imgUrl && imgUrl.startsWith('data:image/')) {
          const match = imgUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (match) {
            resultBuffer = Buffer.from(match[2], 'base64');
            resultMime = `image/${match[1]}`;
          } else {
            throw new Error('Unparseable data URL in JSON output');
          }
        } else {
          throw new Error('No valid image URL in JSON response: ' + responseText.slice(0, 200));
        }
      } catch (jsonErr: any) {
        console.error('[VTON Response Parsing Error]:', jsonErr);
        return res.status(502).json({
          error: 'AI generation failed. Provider returned unexpected data format.',
          detail: responseText.slice(0, 300),
        });
      }
    }

    if (!resultBuffer || resultBuffer.length < 500) {
      console.error('[VTON Error] Result buffer is too small:', resultBuffer?.length);
      return res.status(502).json({
        error: 'Virtual Try-On provider returned empty or corrupt image.',
      });
    }

    // Stage 7 Diagnostic: Result Received and Formatted
    const finalResultUrl = `data:${resultMime};base64,${resultBuffer.toString('base64')}`;
    const jobId = `vton_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log('[VTON Diagnostic Stage 7 - Generated Result Successfully Prepared]', {
      resultBytes: resultBuffer.length,
      mimeType: resultMime,
      jobId,
    });

    // Optional Supabase archival (non-blocking)
    try {
      const supabase = getSupabaseServerClient();
      const storagePath = `users/${userId || 'guest'}/tryon/${jobId}.jpg`;
      supabase.storage
        .from('products')
        .upload(storagePath, resultBuffer, { contentType: resultMime, upsert: true })
        .catch(() => {});
    } catch {}

    return res.status(200).json({
      success: true,
      jobId,
      resultImageUrl: finalResultUrl,
      productId: productId || null,
      userId: userId || 'guest',
      provider: 'RapidAPI Try-On Diffusion',
      createdAt: new Date().toISOString(),
      fitAssessment: 'Photorealistic neural drape synthesized with RapidAPI Try-On Diffusion.',
    });
  } catch (err: any) {
    const isTimeout =
      err?.name === 'TimeoutError' ||
      err?.name === 'AbortError' ||
      (err?.message && err.message.toLowerCase().includes('timeout')) ||
      (err?.message && err.message.toLowerCase().includes('aborted'));

    console.error('[VTON Server Exception]:', err?.message || err);

    if (isTimeout) {
      return res.status(504).json({
        error: 'Virtual Try-On provider request timed out after 50 seconds.',
        detail:
          'RapidAPI Try-On Diffusion service took longer than 50 seconds to respond. The upstream GPU worker may be experiencing high queue load or cold-start delay.',
        status: 504,
      });
    }

    return res.status(500).json({
      error: 'Virtual Try-On processing failed. Please try again.',
      detail: err?.message || 'Network exception during neural try-on processing.',
      status: 500,
    });
  }
}
