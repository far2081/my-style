import type { VercelRequest, VercelResponse } from '@vercel/node';

// Production Gemini Model: gemini-1.5-flash is Google's low-latency, free-tier / pay-as-you-go multimodal model
const GEMINI_MODEL = 'gemini-1.5-flash';

interface StylistPreferencePayload {
  occasion?: string;
  event?: string;
  colors?: string[];
  dressType?: string;
  bodyStructure?: string;
  budget?: string | number;
  style?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    return res.status(503).json({
      error: 'Gemini AI is not configured.',
      detail: 'GEMINI_API_KEY is not set in server environment variables.',
      configured: false,
    });
  }

  const { preferences, availableProducts, userPhotoUrl } = req.body as {
    preferences?: StylistPreferencePayload;
    availableProducts?: Array<{
      id: string;
      name: string;
      category: string;
      event: string;
      occasion: string;
      dressType: string;
      style: string;
      color: string;
      fabric: string;
      price: number;
      stock: number;
    }>;
    userPhotoUrl?: string;
  };

  if (!preferences) {
    return res.status(400).json({ error: 'Preferences payload is required.' });
  }

  // Build a concise catalogue manifest for Gemini to evaluate
  const catalogContext = (availableProducts || []).slice(0, 40).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    event: p.event,
    occasion: p.occasion,
    dressType: p.dressType,
    style: p.style,
    color: p.color,
    fabric: p.fabric,
    price: p.price,
    stock: p.stock,
  }));

  const systemPrompt = `You are the master Haute Couture Fashion Consultant for STYLEMIRA AI, a premier Pakistani luxury fashion house.
Your task is to analyze customer preferences and recommend strictly matching items from the PROVIDED REAL CATALOGUE.

ABSOLUTE RULES:
1. ONLY recommend products from the provided catalog. NEVER invent product IDs, product names, fabrics, prices, or details.
2. The database is the single source of truth.
3. Return recommendations in pure JSON matching this exact structure:
{
  "curatedAdvice": "Short expert styling assessment (2-3 sentences)",
  "recommendedProductIds": ["PROD_ID_1", "PROD_ID_2", ...],
  "reasons": {
    "PROD_ID_1": "Exact why this dress matches the occasion, silhouette, and palette",
    "PROD_ID_2": "Why this secondary choice works"
  },
  "recommendedSilhouettes": ["Silhouette A", "Silhouette B"],
  "undertoneMatch": "Warm Golden / Cool Rose / Neutral Champagne",
  "paletteConfidence": 95
}
4. Respond ONLY with valid JSON. No markdown code blocks, no backticks, no explanatory text outside the JSON.`;

  const userPrompt = `Customer Preferences:
- Occasion: ${preferences.occasion || 'General Festive'}
- Event: ${preferences.event || 'Wedding'}
- Dress Type: ${preferences.dressType || 'Couture Ensemble'}
- Style Aesthetic: ${preferences.style || 'Heritage Royal'}
- Preferred Colors: ${(preferences.colors || []).join(', ') || 'Any'}
- Body Structure: ${preferences.bodyStructure || 'Standard'}
- Budget Range: ${preferences.budget || 'Flexible'}
${userPhotoUrl ? '- User provided a portrait reference for undertone analysis.' : ''}

Real Products Catalog:
${JSON.stringify(catalogContext, null, 2)}

Provide your ranked couture recommendations from the above catalog now.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let status = 502;
      let errorMsg = 'AI generation failed. Please try again.';

      if (response.status === 400 || response.status === 403) {
        errorMsg = 'AI authentication failed.';
        status = 401;
      } else if (response.status === 404) {
        errorMsg = 'Selected AI model is unavailable.';
        status = 503;
      }

      console.error('[Gemini API Error]', response.status, errText);
      return res.status(status).json({
        error: errorMsg,
        detail: errText,
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let parsedResult;
    try {
      // Remove possible markdown formatting just in case
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      parsedResult = {
        curatedAdvice: 'Curated by StyleMira AI fashion intelligence.',
        recommendedProductIds: catalogContext.slice(0, 3).map((p) => p.id),
        reasons: {},
        recommendedSilhouettes: ['A-Line Peshwas', 'Farshi Gharara'],
        paletteConfidence: 92,
      };
    }

    return res.status(200).json({
      success: true,
      provider: `Google Gemini (${GEMINI_MODEL})`,
      ...parsedResult,
    });
  } catch (err: any) {
    console.error('[Gemini Server Exception]', err);
    return res.status(500).json({
      error: 'AI generation failed. Please try again.',
      detail: err?.message || 'Network error connecting to Gemini API',
    });
  }
}
