import { Character } from '../types/character';

// Base free options - RESTORED TO ORIGINAL (minus premium ones)
export const customizationOptions = {
  skinTones: ['#F4C2A1', '#E8B4A0', '#D1A384', '#C4926A', '#A0714E', '#8A5A3C'],
  hairColors: ['#2C1810', '#8B4513', '#D2691E', '#CD853F', '#DDA0DD', '#FF69B4', '#00CED1', '#32CD32', '#9370DB'],
  hairStyles: ['long', 'short', 'ponytail', 'curly', 'bob', 'waves', 'bun', 'mohawk', 'bangs'],
  eyeColors: ['#4A4A4A', '#8B4513', '#228B22', '#4169E1', '#9370DB'],
  topColors: ['#FF8C42', '#FF6B35', '#F4845F', '#E8B4F8', '#FFB6C1', '#98FB98', '#87CEEB', '#F0E68C'],
  bottomColors: ['#FF8C42', '#FF6B35', '#B084CC', '#CD853F', '#4682B4', '#32CD32', '#FF6347'],
  shoeColors: ['#333333', '#FF6B35', '#4B0082', '#228B22', '#FFFFFF'],
  eyebrowColors: ['#000000', '#8B4513', '#FF8C00', '#FFD700'],
  accessories: ['none', 'glasses', 'necklace'],
  expressions: ['happy', 'neutral']
};

// Premium options with costs and unlock levels
export interface PremiumOption {
  value: string;
  label: string;
  cost: number;
  unlockLevel: number;
  rarity: 'rare' | 'epic' | 'legendary';
}

export const premiumOptions = {
  hairStyle: [
    { value: 'braids', label: 'Braids Premium', cost: 25, unlockLevel: 1, rarity: 'rare' as const },
    { value: 'pixie', label: 'Pixie Premium', cost: 35, unlockLevel: 1, rarity: 'epic' as const },
    { value: 'afro', label: 'Afro Premium', cost: 50, unlockLevel: 1, rarity: 'legendary' as const }
  ],
  
  hairColor: [
    { value: '#000000', label: 'Pure Black', cost: 20, unlockLevel: 1, rarity: 'rare' as const },
    { value: '#FFD700', label: 'Pure Gold', cost: 40, unlockLevel: 1, rarity: 'epic' as const },
    { value: '#C0C0C0', label: 'Pure Silver', cost: 60, unlockLevel: 1, rarity: 'legendary' as const }
  ],

  expression: [
    { value: 'excited', label: 'Excited Premium', cost: 15, unlockLevel: 1, rarity: 'rare' as const },
    { value: 'sleepy', label: 'Sleepy Premium', cost: 25, unlockLevel: 1, rarity: 'epic' as const },
    { value: 'calm', label: 'Calm Premium', cost: 35, unlockLevel: 1, rarity: 'legendary' as const }
  ],

  accessory: [
    { value: 'hat', label: 'Hat Premium', cost: 30, unlockLevel: 1, rarity: 'rare' as const },
    { value: 'earrings', label: 'Earrings Premium', cost: 45, unlockLevel: 1, rarity: 'epic' as const },
    { value: 'bow', label: 'Bow Premium', cost: 55, unlockLevel: 1, rarity: 'legendary' as const }
  ],

  shoeColor: [
    { value: '#000000', label: 'Pure Black', cost: 20, unlockLevel: 1, rarity: 'rare' as const },
    { value: '#FFD700', label: 'Pure Gold', cost: 40, unlockLevel: 1, rarity: 'epic' as const },
    { value: '#C0C0C0', label: 'Pure Silver', cost: 60, unlockLevel: 1, rarity: 'legendary' as const }
  ],

  topColor: [
    { value: '#000000', label: 'Pure Black', cost: 20, unlockLevel: 1, rarity: 'rare' as const },
    { value: '#FFD700', label: 'Pure Gold', cost: 40, unlockLevel: 1, rarity: 'epic' as const },
    { value: '#C0C0C0', label: 'Pure Silver', cost: 60, unlockLevel: 1, rarity: 'legendary' as const }
  ],

  bottomColor: [
    { value: '#000000', label: 'Pure Black', cost: 20, unlockLevel: 1, rarity: 'rare' as const },
    { value: '#FFD700', label: 'Pure Gold', cost: 40, unlockLevel: 1, rarity: 'epic' as const },
    { value: '#C0C0C0', label: 'Pure Silver', cost: 60, unlockLevel: 1, rarity: 'legendary' as const }
  ]
};

// Rarity colors for UI
export const rarityColors = {
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600', 
  legendary: 'from-orange-400 to-red-500'
};

export const rarityBorders = {
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-orange-400'
};

export interface Step {
  title: string;
  key: keyof Character;
  options: string[];
  type: 'color' | 'style';
}

export const customizationSteps: Step[] = [
  { title: 'Skin Tone', key: 'skinTone', options: customizationOptions.skinTones, type: 'color' },
  { title: 'Hair Color', key: 'hairColor', options: customizationOptions.hairColors, type: 'color' },
  { title: 'Hair Style', key: 'hairStyle', options: customizationOptions.hairStyles, type: 'style' },
  { title: 'Eye Color', key: 'eyeColor', options: customizationOptions.eyeColors, type: 'color' },
  { title: 'Expression', key: 'expression', options: customizationOptions.expressions, type: 'style' },
  { title: 'Top Color', key: 'topColor', options: customizationOptions.topColors, type: 'color' },
  { title: 'Bottom Color', key: 'bottomColor', options: customizationOptions.bottomColors, type: 'color' },
  { title: 'Shoe Color', key: 'shoeColor', options: customizationOptions.shoeColors, type: 'color' },
  { title: 'Eyebrow Color', key: 'eyebrowColor', options: customizationOptions.eyebrowColors, type: 'color' },
  { title: 'Accessories', key: 'accessory', options: customizationOptions.accessories, type: 'style' },
]; 