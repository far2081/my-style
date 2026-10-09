import type { VercelRequest, VercelResponse } from '@vercel/node';

// RapidAPI Try-On Diffusion API Configuration
const VTON_ENDPOINT = 'https://try-on-diffusion.p.rapidapi.com/try-on-url';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

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

  // Server-side secret extraction (never exposed to client)
  const apiKey = process.env.VTON_API_KEY;
  const apiHost = process.env.VTON_API_HOST || 'try-on-diffusion.p.rapidapi.com';

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    return res.status(503).json({
      error: 'VTON API is not configured.',
      detail: 'VTON_API_KEY is not set in server environment variables.',
      configured: false,
    });
  }

  const {
    avatar_image_url,
    clothing_image_url,
    productId,
    userId,
    customerPhotoBase64,
  } = req.body as {
    avatar_image_url?: string;
    clothing_image_url?: string;
    productId?: string;
    userId?: string;
    customerPhotoBase64?: string;
  };

  const finalAvatarUrl = avatar_image_url || customerPhotoBase64;
  const finalClothingUrl = clothing_image_url;

  if (!finalAvatarUrl || !finalClothingUrl) {
    return res.status(400).json({
      error: 'Both avatar_image_url and clothing_image_url are required.',
    });
  }

  try {
    // Construct multipart form data for RapidAPI endpoint
    const formData = new FormData();
    formData.append('avatar_image_url', finalAvatarUrl);
    formData.append('clothing_image_url', finalClothingUrl);

    const rapidResponse = await fetch(VTON_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': apiKey.trim(),
        'x-rapidapi-host': apiHost.trim(),
      },
      body: formData,
    });

    // Handle HTTP error codes as specified
    if (!rapidResponse.ok) {
      const status = rapidResponse.status;
      const errorText = await rapidResponse.text().catch(() => '');

      if (status === 400) {
        return res.status(400).json({
          error: 'Invalid images provided. Please provide clear frontal portraits and clothing items.',
          detail: errorText,
        });
      }
      if (status === 403) {
        return res.status(403).json({
          error: 'AI authentication failed. Please verify your VTON_API_KEY and API subscription.',
          detail: errorText,
        });
      }
      if (status === 422) {
        return res.status(422).json({
          error: 'Unprocessable image format or unreadable garment silhouette.',
          detail: errorText,
        });
      }
      if (status === 429) {
        return res.status(429).json({
          error: 'Virtual Try-On request quota exhausted. Please try again shortly.',
          detail: errorText,
        });
      }

      return res.status(502).json({
        error: `Virtual Try-On provider returned error ${status}.`,
        detail: errorText,
      });
    }

    const contentType = rapidResponse.headers.get('content-type') || '';
    let resultImageUrl = '';
    const jobId = `vton_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storagePath = `users/${userId || 'guest'}/tryon/${jobId}.jpg`;

    // The API returns the resulting JPEG image directly in successful response
    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      const arrayBuffer = await rapidResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString('base64');
      const mime = contentType.includes('image/') ? contentType : 'image/jpeg';
      resultImageUrl = `data:${mime};base64,${base64Data}`;

      // Save real JPEG result to private Supabase Storage
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        try {
          const uploadEndpoint = `${supabaseUrl}/storage/v1/object/products/${storagePath}`;
          const uploadRes = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'image/jpeg',
              'x-upsert': 'true',
            },
            body: buffer,
          });

          if (uploadRes.ok) {
            resultImageUrl = `${supabaseUrl}/storage/v1/object/public/products/${storagePath}`;
          }

          // Record in database table `tryon_jobs`
          await fetch(`${supabaseUrl}/rest/v1/tryon_jobs`, {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              user_id: userId || null,
              product_id: productId || null,
              input_photo: finalAvatarUrl.slice(0, 500),
              provider: 'RapidAPI Try-On Diffusion',
              status: 'completed',
              result_asset: resultImageUrl,
              created_at: new Date().toISOString(),
            }),
          }).catch(() => {});
        } catch (dbErr) {
          console.warn('[Supabase VTON persist notice]:', dbErr);
        }
      }
    } else {
      // If JSON payload is returned
      const jsonData = (await rapidResponse.json()) as any;
      if (jsonData?.image_url || jsonData?.result_url || jsonData?.url) {
        resultImageUrl = jsonData.image_url || jsonData.result_url || jsonData.url;
      } else if (jsonData?.result || jsonData?.image) {
        resultImageUrl = jsonData.result || jsonData.image;
      }
    }

    if (!resultImageUrl) {
      return res.status(502).json({
        error: 'AI generation failed. No image stream received from provider.',
      });
    }

    return res.status(200).json({
      success: true,
      jobId,
      resultImageUrl,
      storagePath,
      productId,
      userId: userId || 'guest',
      provider: 'RapidAPI Try-On Diffusion',
      createdAt: new Date().toISOString(),
      fitAssessment: 'Photorealistic neural drape mapped onto customer body posture.',
    });
  } catch (err: any) {
    console.error('[VTON Server Exception]:', err);
    return res.status(500).json({
      error: 'AI generation failed. Please try again.',
      detail: err?.message || 'Network error connecting to Virtual Try-On API',
    });
  }
}
