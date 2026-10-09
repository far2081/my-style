import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// RapidAPI Try-On Diffusion Endpoint
const VTON_ENDPOINT = 'https://try-on-diffusion.p.rapidapi.com/try-on-url';
const EXPECTED_HOST = 'try-on-diffusion.p.rapidapi.com';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

// Supabase client helper for server-side operations
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
  const apiKey = process.env.VTON_API_KEY;
  let apiHost = process.env.VTON_API_HOST || EXPECTED_HOST;

  if (apiHost.trim().toLowerCase() !== EXPECTED_HOST) {
    console.warn(`[VTON Config] Overriding configured host '${apiHost}' with required '${EXPECTED_HOST}'`);
    apiHost = EXPECTED_HOST;
  }

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    console.error('[VTON Error] VTON_API_KEY is not configured in Vercel environment variables.');
    return res.status(503).json({
      error: 'Virtual Try-On is not configured.',
      detail: 'VTON_API_KEY environment variable is missing or invalid on the server.',
      configured: false,
    });
  }

  // 2. Extract and Validate Request Payload
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

  const supabase = getSupabaseServerClient();
  let accessibleAvatarUrl = avatar_image_url.trim();
  const accessibleClothingUrl = clothing_image_url.trim();

  // 3. Image Validation & Conversion for avatar_image_url
  // If the user provided a Data URI (base64 from file upload or webcam), upload to Supabase Storage first
  if (accessibleAvatarUrl.startsWith('data:image/')) {
    const match = accessibleAvatarUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({
        error: 'Invalid image format. Supported formats are JPEG, PNG, or WEBP.',
      });
    }

    const rawExt = match[1].toLowerCase();
    const ext = rawExt === 'jpeg' || rawExt === 'jpg' ? 'jpg' : rawExt === 'png' ? 'png' : 'webp';
    const base64Data = match[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Check size limit: no greater than 12 MB
    const maxBytes = 12 * 1024 * 1024;
    if (imageBuffer.length > maxBytes) {
      return res.status(400).json({
        error: `Customer photo size (${(imageBuffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds the 12 MB limit.`,
      });
    }

    if (imageBuffer.length < 500) {
      return res.status(400).json({
        error: 'Customer photo is corrupted or too small. Minimum resolution is 256×256 pixels.',
      });
    }

    // Upload to Supabase Storage to produce an accessible URL for RapidAPI Try-On Diffusion
    const uploadTimestamp = Date.now();
    const randomNonce = Math.random().toString(36).substring(2, 8);
    const storageInputPath = `tryon_inputs/${userId || 'guest'}_${uploadTimestamp}_${randomNonce}.${ext}`;
    const targetBucket = 'products';

    try {
      const { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(storageInputPath, imageBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('[Supabase Storage Upload Error]:', uploadError);
        return res.status(500).json({
          error: 'Failed to securely store customer portrait prior to AI synthesis.',
          detail: uploadError.message,
        });
      }

      // Generate a short-lived signed URL (3600 seconds = 1 hour) for external provider access
      const { data: signedData, error: signError } = await supabase.storage
        .from(targetBucket)
        .createSignedUrl(storageInputPath, 3600);

      if (signedData?.signedUrl) {
        accessibleAvatarUrl = signedData.signedUrl;
      } else {
        // Fallback to public URL if bucket is public
        const { data: publicData } = supabase.storage
          .from(targetBucket)
          .getPublicUrl(storageInputPath);

        accessibleAvatarUrl = publicData.publicUrl;
      }
    } catch (storageException: any) {
      console.error('[Supabase Storage Exception]:', storageException);
      return res.status(500).json({
        error: 'Failed to prepare customer portrait for AI processing.',
        detail: storageException?.message,
      });
    }
  } else {
    // Validate that the provided URL is a valid web URL
    if (!accessibleAvatarUrl.startsWith('http://') && !accessibleAvatarUrl.startsWith('https://')) {
      return res.status(400).json({
        error: 'Invalid customer photo URL. Must be an accessible HTTPS image URL.',
      });
    }
  }

  // Validate that clothing URL is accessible
  if (!accessibleClothingUrl.startsWith('http://') && !accessibleClothingUrl.startsWith('https://')) {
    return res.status(400).json({
      error: 'Invalid clothing image URL. Must be an accessible HTTPS image URL from the catalog.',
    });
  }

  console.log('[VTON Request] Executing RapidAPI Try-On Diffusion:', {
    endpoint: VTON_ENDPOINT,
    host: apiHost,
    productId,
    avatarUrl: accessibleAvatarUrl.substring(0, 100) + '...',
    clothingUrl: accessibleClothingUrl.substring(0, 100) + '...',
  });

  try {
    // 4. Construct Multipart Form Data for RapidAPI
    const formData = new FormData();
    formData.append('avatar_image_url', accessibleAvatarUrl);
    formData.append('clothing_image_url', accessibleClothingUrl);

    // Call RapidAPI Try-On Diffusion endpoint
    const rapidResponse = await fetch(VTON_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': apiKey.trim(),
        'X-RapidAPI-Host': apiHost.trim(),
      },
      body: formData,
    });

    // 5. Handle Provider Errors (400, 403, 422, 429, 500)
    if (!rapidResponse.ok) {
      const status = rapidResponse.status;
      const errorText = await rapidResponse.text().catch(() => '');
      console.error(`[VTON Provider Failure] HTTP ${status}:`, errorText);

      if (status === 400) {
        return res.status(400).json({
          error: 'Invalid images provided. Ensure the customer photo is a clear, well-lit, front-facing portrait (min 256×256).',
          detail: errorText,
          status: 400,
        });
      }
      if (status === 403) {
        return res.status(403).json({
          error: 'Virtual Try-On authentication or subscription failure. Please verify your RapidAPI credentials.',
          detail: errorText,
          status: 403,
        });
      }
      if (status === 422) {
        return res.status(422).json({
          error: 'Validation failure: unprocessable image format or unreadable clothing silhouette.',
          detail: errorText,
          status: 422,
        });
      }
      if (status === 429) {
        return res.status(429).json({
          error: 'Virtual Try-On request quota exhausted or rate limit reached. Please try again shortly.',
          detail: errorText,
          status: 429,
        });
      }
      if (status === 500) {
        return res.status(500).json({
          error: 'Try-On Diffusion provider server error. Please try again.',
          detail: errorText,
          status: 500,
        });
      }

      return res.status(status).json({
        error: `Virtual Try-On provider returned HTTP error ${status}.`,
        detail: errorText,
        status,
      });
    }

    // 6. Process Successful Response (Binary JPEG Image)
    const contentType = rapidResponse.headers.get('content-type') || '';
    console.log('[VTON Success] Provider responded with Content-Type:', contentType);

    let resultBuffer: Buffer;
    let resultMime = 'image/jpeg';

    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      const arrayBuffer = await rapidResponse.arrayBuffer();
      resultBuffer = Buffer.from(arrayBuffer);
      if (contentType.includes('image/')) {
        resultMime = contentType.split(';')[0].trim();
      }
    } else {
      // Some API versions may return a JSON object with URL
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

    // Verify binary image bytes
    if (!resultBuffer || resultBuffer.length < 500) {
      console.error('[VTON Error] Result buffer is too small:', resultBuffer?.length);
      return res.status(502).json({
        error: 'Virtual Try-On provider returned empty or corrupt image.',
      });
    }

    // Verify magic bytes (JPEG: 0xFF, 0xD8 or PNG: 0x89, 0x50)
    const isJpeg = resultBuffer[0] === 0xFF && resultBuffer[1] === 0xD8;
    const isPng = resultBuffer[0] === 0x89 && resultBuffer[1] === 0x50;
    if (!isJpeg && !isPng) {
      console.warn('[VTON Warning] Result buffer magic bytes not standard JPEG/PNG');
    }

    // 7. Store Result in Supabase Storage and Log to Database
    const jobId = `vton_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storagePath = `users/${userId || 'guest'}/tryon/${jobId}.jpg`;
    let finalResultUrl = '';

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(storagePath, resultBuffer, {
          contentType: resultMime,
          upsert: true,
        });

      if (!uploadError) {
        // Create a long-lived signed URL (7 days = 604800 seconds)
        const { data: signedData } = await supabase.storage
          .from('products')
          .createSignedUrl(storagePath, 604800);

        if (signedData?.signedUrl) {
          finalResultUrl = signedData.signedUrl;
        } else {
          const { data: publicData } = supabase.storage
            .from('products')
            .getPublicUrl(storagePath);

          finalResultUrl = publicData.publicUrl;
        }
      } else {
        console.warn('[Supabase Storage Upload Warning]:', uploadError.message);
      }
    } catch (storageEx) {
      console.warn('[Supabase Storage Upload Exception]:', storageEx);
    }

    // If storage upload failed or not configured, return base64 Data URL so customer still receives the REAL image
    if (!finalResultUrl) {
      finalResultUrl = `data:${resultMime};base64,${resultBuffer.toString('base64')}`;
    }

    // Log Try-On job to database table `tryon_jobs`
    try {
      await supabase.from('tryon_jobs').insert({
        user_id: userId || null,
        product_id: productId || null,
        storage_path: storagePath,
        provider: 'RapidAPI Try-On Diffusion',
        status: 'completed',
        result_asset: finalResultUrl.slice(0, 1000),
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('[Supabase Try-On Job DB Notice]:', dbErr);
    }

    // 8. Return Actual Generated Result to Client
    return res.status(200).json({
      success: true,
      jobId,
      resultImageUrl: finalResultUrl,
      storagePath,
      productId: productId || null,
      userId: userId || 'guest',
      provider: 'RapidAPI Try-On Diffusion',
      createdAt: new Date().toISOString(),
      fitAssessment: 'Photorealistic neural drape synthesized with RapidAPI Try-On Diffusion.',
    });
  } catch (err: any) {
    console.error('[VTON Server Exception]:', err);
    return res.status(500).json({
      error: 'AI generation failed. Please try again.',
      detail: err?.message || 'Network exception while connecting to Try-On Diffusion API',
    });
  }
}
