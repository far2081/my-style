import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// RapidAPI Try-On Diffusion Endpoints
const VTON_URL_ENDPOINT = 'https://try-on-diffusion.p.rapidapi.com/try-on-url';
const VTON_FILE_ENDPOINT = 'https://try-on-diffusion.p.rapidapi.com/try-on-file';
const EXPECTED_HOST = 'try-on-diffusion.p.rapidapi.com';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
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
    clothing_image_url,
    productId,
    userId,
  } = req.body as {
    avatar_image_url?: string;
    clothing_image_url?: string;
    productId?: string;
    userId?: string;
  };

  // Stage 1 Diagnostic: Portrait and Garment Received
  const isBase64Avatar = Boolean(avatar_image_url && avatar_image_url.startsWith('data:image/'));
  console.log('[VTON Diagnostic Stage 1 - Request Received]', {
    hasAvatar: Boolean(avatar_image_url && avatar_image_url.trim()),
    isAvatarBase64: isBase64Avatar,
    avatarLength: avatar_image_url ? avatar_image_url.length : 0,
    hasClothing: Boolean(clothing_image_url && clothing_image_url.trim()),
    clothingUrlPreview: clothing_image_url ? clothing_image_url.slice(0, 60) + '...' : 'none',
    productId: productId || 'unspecified',
  });

  if (!avatar_image_url || !avatar_image_url.trim()) {
    return res.status(400).json({
      error: 'Customer portrait photo is required for Virtual Try-On.',
    });
  }

  if (!clothing_image_url || !clothing_image_url.trim()) {
    return res.status(400).json({
      error: 'Product clothing image URL is required from the StyleMira catalog.',
    });
  }

  const rawAvatarUrl = avatar_image_url.trim();
  const accessibleClothingUrl = resolveAccessibleClothingUrl(clothing_image_url, req);

  // Stage 2 Diagnostic: Garment URL Resolved
  console.log('[VTON Diagnostic Stage 2 - Garment Resolved]', {
    clothingUrl: accessibleClothingUrl.slice(0, 80) + '...',
  });

  try {
    let rapidResponse: Response;

    // Prepare Avatar binary buffer
    let avatarBuffer: Buffer;
    let avatarMime = 'image/jpeg';
    let avatarFilename = 'avatar.jpg';

    if (isBase64Avatar) {
      const match = rawAvatarUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({
          error: 'Invalid customer photo format. Supported formats are JPEG, PNG, or WEBP.',
        });
      }
      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' || rawExt === 'jpg' ? 'jpg' : rawExt === 'png' ? 'png' : 'webp';
      avatarMime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      avatarFilename = `avatar.${ext}`;
      avatarBuffer = Buffer.from(match[2], 'base64');
    } else {
      // Fetch avatar URL from Vercel / remote host
      const accessibleAvatarUrl = resolveAccessibleAvatarUrl(rawAvatarUrl, req);
      console.log('[VTON Diagnostic Stage 3A - Fetching Avatar URL Binary]', accessibleAvatarUrl.slice(0, 80));
      const avatarRes = await fetch(accessibleAvatarUrl);
      if (!avatarRes.ok) {
        throw new Error(`Failed to retrieve customer portrait or sample model: HTTP ${avatarRes.status}`);
      }
      avatarBuffer = Buffer.from(await avatarRes.arrayBuffer());
      const rawType = avatarRes.headers.get('content-type') || 'image/jpeg';
      avatarMime = rawType.includes('png') ? 'image/png' : rawType.includes('webp') ? 'image/webp' : 'image/jpeg';
      avatarFilename = avatarMime.includes('png') ? 'avatar.png' : avatarMime.includes('webp') ? 'avatar.webp' : 'avatar.jpg';
    }

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
    console.log('[VTON Diagnostic Stage 3B - Fetching Garment Binary]', accessibleClothingUrl.slice(0, 80));
    const clothingRes = await fetch(accessibleClothingUrl);
    if (!clothingRes.ok) {
      throw new Error(`Failed to retrieve garment image: HTTP ${clothingRes.status}`);
    }
    const clothingBuffer = Buffer.from(await clothingRes.arrayBuffer());
    const rawClothingType = clothingRes.headers.get('content-type') || 'image/jpeg';
    const clothingMime = rawClothingType.includes('png') ? 'image/png' : rawClothingType.includes('webp') ? 'image/webp' : 'image/jpeg';
    const clothingFilename = clothingMime.includes('png') ? 'garment.png' : clothingMime.includes('webp') ? 'garment.webp' : 'garment.jpg';

    console.log('[VTON Diagnostic Stage 4 - Direct Binary Multipart Prepared]', {
      avatarBytes: avatarBuffer.length,
      avatarMime,
      avatarFilename,
      clothingBytes: clothingBuffer.length,
      clothingMime,
      clothingFilename,
      targetEndpoint: VTON_FILE_ENDPOINT,
    });

    // Send direct binary multipart form-data to /try-on-file
    const fileFormData = new FormData();
    fileFormData.append('avatar_image', new Blob([avatarBuffer], { type: avatarMime }), avatarFilename);
    fileFormData.append('clothing_image', new Blob([clothingBuffer], { type: clothingMime }), clothingFilename);

    console.log('[VTON Diagnostic Stage 5 - Calling Try-On Diffusion /try-on-file]');
    rapidResponse = await fetch(VTON_FILE_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': apiKey.trim(),
        'X-RapidAPI-Host': apiHost.trim(),
      },
      body: fileFormData,
    });

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
            body: JSON.stringify({
              avatar_image_url: accessibleAvatarUrl,
              clothing_image_url: accessibleClothingUrl,
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
    console.error('[VTON Server Exception]:', err);
    return res.status(500).json({
      error: 'Virtual Try-On processing failed. Please try again.',
      detail: err?.message || 'Network exception during neural try-on processing.',
    });
  }
}
