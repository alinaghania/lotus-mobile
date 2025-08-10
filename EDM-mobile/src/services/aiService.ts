import * as FileSystem from 'expo-file-system';
import { AppConfig } from '../config/config';

export type MealPrediction = {
  items: string[];
  confidence?: number;
  quantities?: Array<{ name: string; quantity: number; unit?: string }>;
  totalCalories?: number;
};

/**
 * Analyze a meal image (from local URI) using a cloud vision endpoint (e.g., OpenAI Vision).
 * No photo persists locally or remotely beyond this request.
 */
export async function analyzeMealImage(uri: string): Promise<MealPrediction> {
  if (!AppConfig.openAiApiKey) {
    throw new Error('Missing OpenAI API key configuration');
  }

  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  const system = 'You are a precise food detector. Return compact JSON only (no text). Fields: items (string[]), quantities (array of {name, quantity, unit}), totalCalories (number). For quantities prefer servings (0.5, 1, 2) or grams (e.g. 120). Keep lowercase singular names. If uncertain, still provide reasonable approximations.';
  const user = 'Analyze this meal photo. Detect the main items and provide approximate quantities and an overall calories estimate.';

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AppConfig.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: [{ type: 'input_text', text: system }] },
        {
          role: 'user',
          content: [
            { type: 'input_text', text: user },
            { type: 'input_image', image_url: dataUrl },
          ],
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vision API error: ${response.status} ${errText}`);
  }

  const json = await response.json();

  // Try convenience field first
  let output: string | undefined = json?.output_text;

  // Fall back to scanning output content parts
  if (!output && Array.isArray(json?.output) && json.output.length > 0) {
    const parts = json.output[0]?.content || [];
    const textPart = parts.find((p: any) => p?.type === 'output_text' && typeof p?.text === 'string');
    if (textPart) output = textPart.text;
  }

  if (!output) {
    output = '';
  }

  const parsed = parsePrediction(output);
  const items = (parsed.items || []).map(normalizeFoodName);
  return {
    items: Array.from(new Set(items)),
    quantities: parsed.quantities,
    totalCalories: parsed.totalCalories,
  };
}

function parsePrediction(raw: string): { items: string[]; quantities?: Array<{ name: string; quantity: number; unit?: string }>; totalCalories?: number } {
  const text = String(raw || '');
  // First try to extract JSON object
  const fenceMatch = text.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
  const inside = fenceMatch?.[1] ?? text;
  const objMatch = inside.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const obj = JSON.parse(objMatch[0]);
      if (Array.isArray(obj?.items)) {
        const qty = Array.isArray(obj?.quantities)
          ? obj.quantities.map((q: any) => ({
              name: cleanFoodToken(q?.name),
              quantity: Number(q?.quantity) || 0,
              unit: typeof q?.unit === 'string' ? q.unit.toLowerCase() : undefined,
            }))
          : undefined;
        return {
          items: (obj.items as any[]).map((s: any) => String(s)).map(cleanFoodToken).filter(Boolean),
          quantities: qty,
          totalCalories: typeof obj?.totalCalories === 'number' ? obj.totalCalories : undefined,
        };
      }
    } catch {}
  }

  // Fallback to array-only parsing
  const arr = sanitizeAndExtractItems(text);
  return { items: arr };
}

function sanitizeAndExtractItems(raw: string): string[] {
  if (!raw || typeof raw !== 'string') return [];

  let text = String(raw);

  const fenceMatch = text.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) {
    text = fenceMatch[1];
  }

  text = text
    .replace(/`+/g, '')
    .replace(/^[\s\t]*json\s*:?[\s\t]*/gim, '');

  const arrayMatch = text.match(/\[[\s\S]*?\]/);
  if (arrayMatch) {
    try {
      const arr = JSON.parse(arrayMatch[0]);
      if (Array.isArray(arr)) {
        return arr
          .map((s: any) => String(s))
          .map(cleanFoodToken)
          .filter(Boolean);
      }
    } catch {}
  }

  return text
    .split(/[,\n;•\-]+/)
    .map(cleanFoodToken)
    .filter(Boolean);
}

function cleanFoodToken(token: string): string {
  let s = String(token || '')
    .replace(/[\[\]\r\"']/g, '')
    .trim()
    .toLowerCase();

  s = s
    .replace(/^json\s*:?/i, '')
    .replace(/^json(?=[a-z])/i, '')
    .replace(/`+/g, '')
    .trim();

  s = s.replace(/[.,;:]+$/g, '').trim();

  return s;
}

function normalizeFoodName(name: string): string {
  const n = name.toLowerCase();
  const map: Record<string, string> = {
    pizzas: 'pizza',
    fries: 'fry',
    chips: 'chip',
    cookies: 'cookie',
    yogurts: 'yogurt',
    coffees: 'coffee',
    teas: 'tea',
    smoothies: 'smoothie',
    salads: 'salad',
    pastas: 'pasta',
    tacos: 'taco',
    burritos: 'burrito',
    sandwiches: 'sandwich',
    burgers: 'burger',
    pancakes: 'pancake',
    waffles: 'waffle',
    muffins: 'muffin',
    eggs: 'egg',
  };
  return map[n] || n;
} 