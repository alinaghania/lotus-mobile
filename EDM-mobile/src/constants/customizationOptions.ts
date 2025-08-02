export interface PremiumOption {
  value: string;
  label: string;
  cost: number;
  rarity: 'common' | 'rare' | 'epic';
}

export const customizationSteps = [
  {
    key: 'skin',
    title: 'Skin Tone',
    type: 'color',
    options: [
      // FREE OPTIONS (5 most common official colors)
      '#edb98a', // Light beige
      '#ffdbb4', // Very light
      '#d08b5b', // Medium golden
      '#614335', // Medium dark
      '#ae5d29', // Dark rich
    ]
  },
  {
    key: 'hair',
    title: 'Hair & Hats',
    type: 'text',
    options: [
      // FREE HAIR OPTIONS
      'straight01',    // Long straight
      'bob',           // Short bob
      'curly',         // Curly
      'bun',           // Hair bun
      'shortFlat',     // Short flat
      'fro',           // Afro
      'longButNotTooLong', // Medium length
      'shortCurly',    // Short curly
      'straight02',    // Straight variant
      'shortRound',    // Short round
      'shortWaved',    // Short waved
      'sides',         // Side cut
      'curvy',         // Wavy
    ]
  },
  {
    key: 'hairColor',
    title: 'Hair Color',
    type: 'color',
    options: [
      // FREE OPTIONS (6 most common official colors)
      '#a55728', // Brown
      '#2c1b18', // Black
      '#b58143', // Light brown
      '#d6b370', // Blonde
      '#724133', // Dark brown
      '#4a312c', // Dark auburn
    ]
  },
  {
    key: 'eyebrows',
    title: 'Eyebrows',
    type: 'text',
    options: [
      // FREE OPTIONS
      'defaultNatural',    // Natural
      'raisedExcitedNatural', // Excited
      'flatNatural',       // Flat
      'angryNatural',      // Angry
      'frownNatural',      // Frown
      'sadConcernedNatural', // Concerned
      'upDownNatural',     // Asymmetric
      'default',           // Simple
      'raisedExcited',     // Raised
      'angry',             // Furious
    ]
  },
  {
    key: 'eyes',
    title: 'Eye Expression',
    type: 'text',
    options: [
      // FREE OPTIONS
      'happy',       // Happy
      'default',     // Normal
      'wink',        // Wink
      'surprised',   // Surprised
      'hearts',      // In love
      'squint',      // Squint
      'side',        // Side glance
      'eyeRoll',     // Eye roll
      'winkWacky',   // Wacky wink
    ]
  },
  {
    key: 'mouth',
    title: 'Mouth Expression',
    type: 'text',
    options: [
      // FREE OPTIONS
      'smile',       // Smile
      'default',     // Normal
      'twinkle',     // Mischievous
      'serious',     // Serious
      'disbelief',   // Disbelief
      'eating',      // Eating
      'grimace',     // Grimace
      'screamOpen',  // Scream
    ]
  },
  {
    key: 'outfit',
    title: 'Outfit Style',
    type: 'text',
    options: [
      // FREE OPTIONS
      'shirtCrewNeck',    // Basic t-shirt
      'blazerAndShirt',   // Blazer + shirt
      'hoodie',           // Hoodie
      'blazerAndSweater', // Blazer + sweater
      'shirtVNeck',       // V-neck
      'collarAndSweater', // Collar + sweater
      'graphicShirt',     // Graphic tee
      'shirtScoopNeck',   // Scoop neck
    ]
  },
  {
    key: 'outfitColor',
    title: 'Outfit Color',
    type: 'color',
    options: [
      // FREE COLORS
      '#65c9ff', // Sky blue
      '#5199e4', // Blue
      '#b1e2ff', // Pastel blue
      '#a7ffc4', // Mint green
      '#ffafb9', // Pastel pink
      '#ffffb1', // Pale yellow
      '#e6e6e6', // Light gray
      '#ffffff', // White
    ]
  },
  {
    key: 'outfitGraphic',
    title: 'T-shirt Design',
    type: 'text',
    options: [
      // FREE GRAPHICS
      'none',       // No design
      'bear',       // Bear
      'pizza',      // Pizza
      'skull',      // Skull
      'bat',        // Bat
      'deer',       // Deer
      'hola',       // Hola text
    ]
  },
  {
    key: 'accessories',
    title: 'Accessories',
    type: 'text',
    options: [
      // FREE ACCESSORIES
      'none',         // None
      'prescription01', // Basic glasses
      'sunglasses',   // Sunglasses
      'round',        // Round glasses
      'wayfarers',    // Wayfarers
      'kurt',         // Kurt style
    ]
  },
  {
    key: 'accessoryColor',
    title: 'Accessory Color',
    type: 'color',
    options: [
      // FREE ACCESSORY COLORS
      '#262e33', // Navy
      '#5199e4', // Blue
      '#ffafb9', // Pink
      '#ffffb1', // Yellow
      '#929598', // Gray
      '#ffffff', // White
    ]
  }
];

export const premiumOptions = {
  skin: [
    { value: '#fd9841', label: 'Golden Glow', cost: 80, rarity: 'rare' },
    { value: '#f8d25c', label: 'Sunshine', cost: 120, rarity: 'epic' }
  ],
  hair: [
    // PREMIUM HAIR STYLES
    { value: 'miaWallace', label: 'Mia Wallace', cost: 200, rarity: 'epic' },
    { value: 'frida', label: 'Frida Style', cost: 150, rarity: 'rare' },
    { value: 'bigHair', label: 'Big Hair', cost: 120, rarity: 'rare' },
    
    // PREMIUM HATS (merged into hair!)
    { value: 'hat', label: 'Classic Hat', cost: 180, rarity: 'rare' },
    { value: 'hijab', label: 'Elegant Hijab', cost: 150, rarity: 'rare' },
    { value: 'turban', label: 'Royal Turban', cost: 200, rarity: 'epic' },
    { value: 'winterHat1', label: 'Cozy Beanie', cost: 120, rarity: 'rare' },
    { value: 'winterHat02', label: 'Chic Beanie', cost: 140, rarity: 'rare' },
    { value: 'winterHat03', label: 'Fashion Beanie', cost: 160, rarity: 'epic' }
  ],
  hairColor: [
    { value: '#f59797', label: 'Rose Gold', cost: 100, rarity: 'rare' },
    { value: '#ecdcbf', label: 'Platinum Blonde', cost: 150, rarity: 'epic' },
    { value: '#c93305', label: 'Fire Red', cost: 120, rarity: 'rare' },
    { value: '#e8e1e1', label: 'Silver White', cost: 180, rarity: 'epic' }
  ],
  eyebrows: [
    { value: 'unibrowNatural', label: 'Unibrow', cost: 90, rarity: 'epic' },
    { value: 'sadConcerned', label: 'Melancholic', cost: 60, rarity: 'rare' },
    { value: 'upDown', label: 'Asymmetric', cost: 70, rarity: 'rare' }
  ],
  eyes: [
    { value: 'xDizzy', label: 'Dizzy', cost: 100, rarity: 'epic' },
    { value: 'cry', label: 'Crying', cost: 80, rarity: 'rare' },
    { value: 'closed', label: 'Closed', cost: 60, rarity: 'rare' }
  ],
  mouth: [
    { value: 'tongue', label: 'Tongue Out', cost: 100, rarity: 'epic' },
    { value: 'vomit', label: 'Sick', cost: 150, rarity: 'epic' },
    { value: 'concerned', label: 'Concerned', cost: 70, rarity: 'rare' }
  ],
  outfit: [
    { value: 'overall', label: 'Cute Overall', cost: 200, rarity: 'epic' },
    { value: 'dress', label: 'Simple Dress', cost: 180, rarity: 'rare' }
  ],
  outfitColor: [
    { value: '#ff488e', label: 'Hot Pink', cost: 120, rarity: 'rare' },
    { value: '#ff5c5c', label: 'Neon Red', cost: 150, rarity: 'epic' },
    { value: '#3c4f5c', label: 'Midnight Blue', cost: 100, rarity: 'rare' },
    { value: '#ffdeb5', label: 'Peach Cream', cost: 90, rarity: 'rare' }
  ],
  outfitGraphic: [
    { value: 'diamond', label: 'Diamond Bling', cost: 150, rarity: 'rare' },
    { value: 'resist', label: 'Rebel Text', cost: 200, rarity: 'epic' },
    { value: 'cumbia', label: 'Cumbia Music', cost: 120, rarity: 'rare' }
  ],
  accessories: [
    { value: 'prescription02', label: 'Designer Glasses', cost: 150, rarity: 'rare' },
    { value: 'eyepatch', label: 'Pirate Patch', cost: 250, rarity: 'epic' }
  ],
  accessoryColor: [
    { value: '#ff488e', label: 'Pink Glow', cost: 120, rarity: 'rare' },
    { value: '#ff5c5c', label: 'Red Glow', cost: 150, rarity: 'epic' },
    { value: '#a7ffc4', label: 'Mint Glow', cost: 100, rarity: 'rare' },
    { value: '#ffdeb5', label: 'Golden Shine', cost: 130, rarity: 'rare' }
  ]
} as const; 