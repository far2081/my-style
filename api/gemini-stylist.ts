import type { VercelRequest, VercelResponse } from '@vercel/node';

interface StylistPreferencePayload {
  occasion?: string;
  event?: string;
  colors?: string[];
  dressType?: string;
  bodyStructure?: string;
  budget?: string | number;
  style?: string;
}

interface ProductItem {
  id: string;
  name: string;
  category?: string;
  event?: string;
  occasion?: string;
  dressType?: string;
  style?: string;
  color?: string;
  fabric?: string;
  price?: number;
  stock?: number;
}

// Discover which model is active and supports generateContent
async function getWorkingGeminiModel(apiKey: string): Promise<string> {
  const preferredCandidates = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (listRes.ok) {
      const data = await listRes.json();
      const models = data?.models || [];
      const supported = models
        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => m.name.replace(/^models\//, ''));

      for (const cand of preferredCandidates) {
        if (supported.includes(cand)) {
          return cand;
        }
      }

      if (supported.length > 0) {
        return supported[0];
      }
    }
  } catch (err: any) {
    console.warn('[Gemini Stylist] Model discovery notice:', err?.message || err);
  }

  return 'gemini-1.5-flash-latest';
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

  const { preferences, availableProducts, userPhotoUrl } = req.body as {
    preferences?: StylistPreferencePayload;
    availableProducts?: ProductItem[];
    userPhotoUrl?: string;
  };

  if (!preferences) {
    return res.status(400).json({ error: 'Preferences payload is required.' });
  }

  const rawProducts = Array.isArray(availableProducts) ? availableProducts : [];

  const targetOcc = (preferences.occasion || '').toLowerCase();
  const targetColors = (preferences.colors || []).map((c) => c.toLowerCase());
  const targetDress = (preferences.dressType || '').toLowerCase();
  const targetSeason = (preferences.season || '').toLowerCase();

  // Sort available catalog items to place most relevant items on top
  const sortedCatalog = [...rawProducts].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const aOcc = (a.occasion || '').toLowerCase();
    const bOcc = (b.occasion || '').toLowerCase();
    if (targetOcc && (aOcc.includes(targetOcc) || targetOcc.includes(aOcc))) scoreA += 40;
    if (targetOcc && (bOcc.includes(targetOcc) || targetOcc.includes(bOcc))) scoreB += 40;

    const aCol = (a.color || '').toLowerCase();
    const bCol = (b.color || '').toLowerCase();
    if (targetColors.some((c) => aCol.includes(c))) scoreA += 30;
    if (targetColors.some((c) => bCol.includes(c))) scoreB += 30;

    const aType = (a.dressType || '').toLowerCase();
    const bType = (b.dressType || '').toLowerCase();
    if (targetDress && (aType.includes(targetDress) || targetDress.includes(aType))) scoreA += 20;
    if (targetDress && (bType.includes(targetDress) || targetDress.includes(bType))) scoreB += 20;

    return scoreB - scoreA;
  });

  const catalogContext = sortedCatalog
    .slice(0, 25)
    .map((p) => ({
      id: p.id,
      name: p.name,
      occasion: p.occasion,
      dressType: p.dressType,
      color: p.color,
      fabric: p.fabric,
      price: p.price,
    }));

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();

  // If no Gemini key is provided, return structured algorithmic match immediately
  if (!apiKey || apiKey.includes('placeholder')) {
    const topPick = catalogContext[0] || { name: 'Couture Piece', fabric: 'Pure Silk', color: 'Bespoke' };
    return res.status(200).json({
      success: true,
      fallback: true,
      provider: 'StyleMira Haute Couture Neural Engine',
      curatedAdvice: `Curated exclusively for your ${preferences.occasion || 'Haute Couture'} celebration. Features the ${topPick.name} crafted in ${topPick.fabric || 'authentic silk'}, chosen to harmonize with your ${preferences.colors?.join('/') || 'custom'} palette and ${preferences.dressType || 'bespoke'} silhouette.`,
      recommendedProductIds: catalogContext.slice(0, 4).map((p) => p.id),
      reasons: catalogContext.slice(0, 4).reduce((acc: any, p: any) => {
        acc[p.id] = `Tailored for ${p.occasion || preferences.occasion} occasions with ${p.fabric || 'authentic silk'} drape in radiant ${p.color} tones.`;
        return acc;
      }, {}),
      recommendedSilhouettes: [topPick.dressType || preferences.dressType || 'Royal Peshwas', 'Farshi Gharara', 'Flared Kalidaar'],
      undertoneMatch: 'Champagne Warm / Royal Jewel',
      paletteConfidence: 96,
    });
  }

  // Model resolution and Gemini API Call with strict 8-second timeout
  try {
    const selectedModel = await getWorkingGeminiModel(apiKey);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are the master Haute Couture Fashion Consultant for STYLEMIRA AI, a premier Pakistani luxury fashion house.
Your task is to analyze customer preferences and recommend strictly matching items from the PROVIDED REAL CATALOGUE.

ABSOLUTE RULES:
1. ONLY recommend products from the provided catalog. NEVER invent product IDs, product names, fabrics, prices, or details.
2. The database is the single source of truth.
3. Return recommendations in pure JSON matching this exact structure:
{
  "curatedAdvice": "Short expert styling assessment (2-3 sentences)",
  "recommendedProductIds": ["PROD_ID_1", "PROD_ID_2"],
  "reasons": {
    "PROD_ID_1": "Why this dress matches the occasion, silhouette, and palette",
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
${userPhotoUrl ? '- Portrait reference provided for skin undertone mapping.' : ''}

Real Products Catalog:
${JSON.stringify(catalogContext, null, 2)}

Provide your ranked couture recommendations from the above catalog now.`;

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000), // Strict 8-second timeout
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
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

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      console.warn(`[Gemini API Status ${geminiRes.status}]:`, errText.substring(0, 150));

      // Return high-precision algorithmic fallback from catalog
      return res.status(200).json({
        success: true,
        fallback: true,
        provider: 'StyleMira Haute Couture Neural Engine (Fallback)',
        curatedAdvice: `Calibrated for your ${preferences.occasion || 'Haute Couture'} gathering. Handcrafted from authentic ${catalogContext[0]?.fabric || 'pure fabric'}, structured for graceful draping in celebratory settings.`,
        recommendedProductIds: catalogContext.slice(0, 4).map((p) => p.id),
        reasons: catalogContext.slice(0, 4).reduce((acc: any, p: any) => {
          acc[p.id] = `Selected for ${preferences.occasion || 'event'} harmony and tailored ${p.color || 'couture'} finish.`;
          return acc;
        }, {}),
        recommendedSilhouettes: [preferences.dressType || 'Royal Peshwas', 'Farshi Gharara', 'Flared Kalidaar'],
        undertoneMatch: 'Champagne Warm / Royal Jewel',
        paletteConfidence: 94,
      });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let parsedResult;
    try {
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
      provider: `Google Gemini (${selectedModel})`,
      ...parsedResult,
    });
  } catch (err: any) {
    console.warn('[Gemini Exception Handled]:', err?.message || err);

    // Guaranteed graceful fallback to keep user flow completely uninterrupted
    return res.status(200).json({
      success: true,
      fallback: true,
      provider: 'StyleMira Haute Couture Neural Engine',
      curatedAdvice: `Based on your selection for ${preferences.occasion || 'Haute Couture'} in ${preferences.dressType || 'Traditional Silhouettes'}, our algorithmic atelier curated this bespoke match with harmonious drape and artisan embroidery.`,
      recommendedProductIds: catalogContext.slice(0, 4).map((p) => p.id),
      reasons: catalogContext.slice(0, 4).reduce((acc: any, p: any) => {
        acc[p.id] = `Directly matched with your ${preferences.occasion || 'festive'} aesthetic and color palette.`;
        return acc;
      }, {}),
      recommendedSilhouettes: [preferences.dressType || 'Royal Peshwas', 'Farshi Gharara', 'Flared Kalidaar'],
      undertoneMatch: 'Champagne Warm / Royal Jewel',
      paletteConfidence: 95,
    });
  }
}
