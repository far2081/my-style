import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cloudflare Workers AI free-tier compatible high-quality image generation models:
// Primary: @cf/black-forest-labs/flux-1-schnell
// Fallback: @cf/stabilityai/stable-diffusion-xl-base-1.0
const CF_IMAGE_MODELS = [
  '@cf/black-forest-labs/flux-1-schnell',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
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

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId || apiToken.includes('placeholder') || accountId.includes('placeholder')) {
    return res.status(503).json({
      error: 'Cloudflare AI is not configured.',
      detail: 'CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID is missing from server environment variables.',
      configured: false,
    });
  }

  const {
    prompt,
    dressType,
    color,
    fabric,
    embroidery,
    silhouette,
    sleeves,
    neckline,
    dupatta,
    occasion,
    style,
    userId,
  } = req.body as {
    prompt?: string;
    dressType?: string;
    color?: string;
    fabric?: string;
    embroidery?: string;
    silhouette?: string;
    sleeves?: string;
    neckline?: string;
    dupatta?: string;
    occasion?: string;
    style?: string;
    userId?: string;
  };

  if (!prompt && !dressType) {
    return res.status(400).json({ error: 'A design prompt or dress specification is required.' });
  }

  // Synthesize rich Pakistani couture prompt
  const richPromptParts = [
    'Haute couture luxury Pakistani bridal fashion photography',
    dressType ? `Garment: ${dressType}` : '',
    silhouette ? `Silhouette: ${silhouette}` : '',
    color ? `Primary color palette: ${color}` : '',
    fabric ? `Fabric: authentic ${fabric}` : '',
    embroidery ? `Embroidery: hand-worked intricate ${embroidery}` : 'Zardozi and tilla threadwork',
    neckline ? `Neckline: ${neckline}` : '',
    sleeves ? `Sleeves: ${sleeves}` : '',
    dupatta ? `Dupatta drape: ${dupatta}` : 'embroidered scalloped border dupatta',
    occasion ? `Event: ${occasion}` : '',
    style ? `Aesthetic: ${style}` : 'Royal Mughal regal aesthetic',
    prompt ? `Specific couture details: ${prompt}` : '',
    'Studio lighting, 8k resolution, photorealistic, intricate embroidery texture, high fashion editorial, Vogue runway quality.',
  ];

  const fullPrompt = richPromptParts.filter(Boolean).join(', ');

  // Try primary model, fallback if needed
  let lastError: any = null;

  for (const model of CF_IMAGE_MODELS) {
    try {
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

      const cfResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          num_steps: model.includes('flux') ? 4 : 20,
        }),
      });

      if (cfResponse.status === 401 || cfResponse.status === 403) {
        return res.status(401).json({
          error: 'AI authentication failed.',
          detail: 'Invalid CLOUDFLARE_API_TOKEN or insufficient permissions.',
        });
      }

      if (cfResponse.status === 404) {
        lastError = 'Selected AI model is unavailable.';
        continue; // try fallback
      }

      if (!cfResponse.ok) {
        const errText = await cfResponse.text();
        console.error(`[Cloudflare AI error on ${model}]:`, cfResponse.status, errText);
        lastError = `AI generation failed on ${model}: ${errText}`;
        continue;
      }

      const contentType = cfResponse.headers.get('content-type') || '';

      let base64Image = '';

      if (contentType.includes('image/')) {
        const arrayBuffer = await cfResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = `data:${contentType};base64,${buffer.toString('base64')}`;
      } else {
        // Some models return JSON { result: { image: "base64..." } }
        const jsonData = (await cfResponse.json()) as any;
        if (jsonData?.result?.image) {
          base64Image = `data:image/png;base64,${jsonData.result.image}`;
        } else if (jsonData?.result?.images?.[0]) {
          base64Image = `data:image/png;base64,${jsonData.result.images[0]}`;
        }
      }

      if (!base64Image) {
        lastError = 'Invalid image payload received from Cloudflare Workers AI.';
        continue;
      }

      const jobId = `cf_job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const projectId = `proj_${Date.now()}`;
      const storagePath = `users/${userId || 'guest'}/dress-studio/${projectId}.png`;

      // Upload to Supabase Storage if supabase credentials exist
      let publicImageUrl = base64Image;
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        try {
          const rawBase64 = base64Image.split(',')[1];
          const imageBuffer = Buffer.from(rawBase64, 'base64');

          const uploadEndpoint = `${supabaseUrl}/storage/v1/object/products/${storagePath}`;
          const uploadRes = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'image/png',
              'x-upsert': 'true',
            },
            body: imageBuffer,
          });

          if (uploadRes.ok) {
            publicImageUrl = `${supabaseUrl}/storage/v1/object/public/products/${storagePath}`;
          }
        } catch (uploadErr) {
          console.warn('[Storage upload notice]:', uploadErr);
        }
      }

      return res.status(200).json({
        success: true,
        jobId,
        projectId,
        isAiConcept: true,
        conceptName: `AI CONCEPT: ${dressType || 'Bespoke Couture'}`,
        imageUrl: publicImageUrl,
        storagePath,
        provider: 'Cloudflare Workers AI',
        model,
        prompt: fullPrompt,
        fabricBreakdown: fabric || 'Pure Katan Silk & Tissue Organza',
        colorPalette: [color || '#321B2F', '#C9A86A', '#E9D5D8', '#4A2438'],
        suggestedEmbellishments: [embroidery || 'Hand-carved Nakshi', 'French Bullion Knot', 'Micro-sequin Zari'],
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    } catch (e: any) {
      lastError = e?.message || 'Error executing request';
    }
  }

  return res.status(502).json({
    error: lastError?.includes('unavailable') ? 'Selected AI model is unavailable.' : 'AI generation failed. Please try again.',
    detail: lastError,
  });
}
