import { DailyRecord } from '../types/tracking';

// Very small, extendable calorie-per-serving estimates (cost-efficient, offline)
// Values approximate typical portions. Unit is per common serving.
const CALORIE_MAP: Record<string, { kcalPerServing: number; defaultUnit?: string }> = {
  // Breakfast
  oatmeal: { kcalPerServing: 150 },
  pancake: { kcalPerServing: 90 },
  yogurt: { kcalPerServing: 100 },
  smoothie: { kcalPerServing: 200 },
  egg: { kcalPerServing: 70 },
  'avocado toast': { kcalPerServing: 250 },
  granola: { kcalPerServing: 140 },
  'fruit salad': { kcalPerServing: 120 },
  bagel: { kcalPerServing: 250 },
  cereal: { kcalPerServing: 180 },
  muffin: { kcalPerServing: 300 },
  waffle: { kcalPerServing: 120 },

  // Lunch/dinner
  salad: { kcalPerServing: 200 },
  sandwich: { kcalPerServing: 350 },
  soup: { kcalPerServing: 150 },
  pasta: { kcalPerServing: 350 },
  'rice bowl': { kcalPerServing: 400 },
  'quinoa bowl': { kcalPerServing: 380 },
  burger: { kcalPerServing: 500 },
  sushi: { kcalPerServing: 300 },
  wrap: { kcalPerServing: 350 },
  taco: { kcalPerServing: 180 },
  burrito: { kcalPerServing: 600 },
  'grilled chicken': { kcalPerServing: 250 },
  'stir fry': { kcalPerServing: 350 },
  pizza: { kcalPerServing: 285 },
  'veggie burger': { kcalPerServing: 400 },
  steak: { kcalPerServing: 650 },
  fish: { kcalPerServing: 220 },
  seafood: { kcalPerServing: 250 },
  curry: { kcalPerServing: 400 },
  risotto: { kcalPerServing: 450 },
  lasagna: { kcalPerServing: 500 },

  // Snacks & drinks
  fruit: { kcalPerServing: 80 },
  nuts: { kcalPerServing: 170 },
  'granola bar': { kcalPerServing: 120 },
  cookie: { kcalPerServing: 70 },
  chip: { kcalPerServing: 150 },
  popcorn: { kcalPerServing: 90 },
  'dark chocolate': { kcalPerServing: 170 },
  'protein shake': { kcalPerServing: 200 },
  coffee: { kcalPerServing: 2 },
  tea: { kcalPerServing: 2 },
  soda: { kcalPerServing: 140 },
  juice: { kcalPerServing: 120 },
  alcohol: { kcalPerServing: 150 },
  smoothie_drink: { kcalPerServing: 200 },
};

function normalizeItemName(name: string): string {
  const n = (name || '').toLowerCase().trim();
  if (n in CALORIE_MAP) return n;
  // Try simple mappings and fallbacks
  if (n.includes('avocado') && n.includes('toast')) return 'avocado toast';
  if (n.includes('rice') && n.includes('bowl')) return 'rice bowl';
  if (n.includes('quinoa') && n.includes('bowl')) return 'quinoa bowl';
  if (n.includes('granola') && n.includes('bar')) return 'granola bar';
  if (n.includes('dark') && n.includes('chocolate')) return 'dark chocolate';
  if (n === 'smoothie' && !('smoothie' in CALORIE_MAP)) return 'smoothie_drink';
  return n;
}

function estimateForItems(items: string[]): number {
  let total = 0;
  items.forEach(raw => {
    const item = normalizeItemName(raw);
    const base = CALORIE_MAP[item];
    total += base ? base.kcalPerServing : 200; // fallback avg
  });
  return total;
}

export function estimateCaloriesForItems(items: string[]): number {
  return Math.round(estimateForItems(items || []));
}

export function estimateCaloriesForEntries(entries: Array<{ name: string; quantity: number }>): number {
  let total = 0;
  entries.forEach(e => {
    const item = normalizeItemName(e.name);
    const base = CALORIE_MAP[item];
    const qty = isNaN(e.quantity) ? 0 : Math.max(0, e.quantity);
    total += (base ? base.kcalPerServing : 200) * (qty || 1);
  });
  return Math.round(total);
}

export function estimateCaloriesForRecord(record: DailyRecord): number {
  if (!record?.meals) return 0;
  const parts: string[] = [];
  const add = (s?: string) => { if (s) parts.push(...s.split(',').map(p => p.trim()).filter(Boolean)); };
  add(record.meals.morning);
  add(record.meals.afternoon);
  add(record.meals.evening);
  add(record.meals.snack);
  return Math.round(estimateForItems(parts));
} 