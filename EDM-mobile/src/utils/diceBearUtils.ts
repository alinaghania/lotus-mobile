import { Character } from '../types/character';

// DiceBear AVATAAARS options mapping - PERFECT DOLL AVATARS! 💅✨
// Using EXACT values from the AVATAAARS JSON schema for maximum cute factor
export const DICEBEAR_AVATAAARS_OPTIONS = {
  // Hair styles (GIRLY & CUTE!) - All available from schema
  hairStyles: [
    // SUPER GIRLY STYLES 💇‍♀️ - CORRECT AVATAAARS NAMES
    'straight01', 'straight02', 'straightAndStrand', 'bob', 'bun', 'curly', 'curvy',
    'dreads', 'dreads01', 'dreads02', 'frida', 'fro', 'froBand', 'longButNotTooLong',
    'miaWallace', 'shavedSides', 'frizzle', 'shaggy', 'shaggyMullet', 'shortCurly',
    'shortFlat', 'shortRound', 'shortWaved', 'sides', 'theCaesar', 'theCaesarAndSidePart', 'bigHair'
  ] as const,
  
  // Hair colors (BEAUTIFUL!) - Hex values
  hairColors: ['f59e0b', '92400e', '1f2937', 'dc2626', 'd97706', '451a03'] as const,
  
  // Skin colors (DIVERSE & NATURAL) - Hex values
  skinColors: ['f2d3d1', 'fdbcb4', 'f1c3a7', 'd08b5b', 'e8b98a', 'c89666', '8b5a3c', '6b3e2a', '4a2c2a'] as const,
  
  // Eyes (EXPRESSIVE & CUTE!) - EXACT schema values
  eyeStyles: ['closed', 'cry', 'default', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'winkWacky', 'wink', 'xDizzy'] as const,
  
  // Eyebrows (PERFECT DETAIL!) - EXACT schema values
  eyebrowStyles: ['angryNatural', 'defaultNatural', 'flatNatural', 'frownNatural', 'raisedExcitedNatural', 'sadConcernedNatural', 'unibrowNatural', 'upDownNatural', 'angry', 'default', 'raisedExcited', 'sadConcerned', 'upDown'] as const,
  
  // Mouth expressions (CUTE & GIRLY!) - Keep as is
  mouthStyles: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'] as const,
  
  // Clothing (FASHIONABLE!) - EXACT schema values
  clothingStyles: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'] as const,
  
  // Clothing colors (STYLISH!) - Hex values
  clothingColors: ['ec4899', '93c5fd', 'f9a8d4', '3b82f6', '34d399', 'fbbf24'] as const,
  
  // Accessories (CUTE DETAILS!) - EXACT schema values
  accessoryStyles: ['blank', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers', 'eyepatch'] as const,
  
  // Accessory colors (FASHIONABLE!) - Hex values
  accessoryColors: ['000000', '3b82f6', 'ec4899', 'fbbf24'] as const
};

// Map our Character type to DiceBear AVATAAARS options (PERFECT DOLL MAPPING!)
export const mapCharacterToAvataaars = (character: Character) => {
  
  // Map skin color to EXACT AVATAAARS hex values (ALL OFFICIAL COLORS!)
  const mapSkinColor = (skin: string): string => {
    const skinMap: { [key: string]: string } = {
      // OFFICIAL AVATAAARS FREE COLORS (no # prefix needed)
      '#edb98a': 'edb98a',  // Light beige (most popular!)
      '#ffdbb4': 'ffdbb4',  // Very light (pale!)
      '#d08b5b': 'd08b5b',  // Medium light (golden!)
      '#614335': '614335',  // Medium dark (warm!)
      '#ae5d29': 'ae5d29',  // Dark (rich!)
      
      // OFFICIAL AVATAAARS PREMIUM COLORS
      '#fd9841': 'fd9841',  // Golden Glow (premium!)
      '#f8d25c': 'f8d25c',  // Sunshine (premium!)
      
      // Backwards compatibility (map to closest official color)
      '#FDBCB4': 'ffdbb4',  // Old light -> new very light
      '#F1C3A7': 'edb98a',  // Old beige -> new light beige
      '#E8B98A': 'edb98a',  // Old golden -> new light beige
      '#D4A574': 'd08b5b',  // Old medium light -> new medium light
      '#C89666': 'd08b5b',  // Old medium -> new medium light
      '#B08650': '614335',  // Old medium dark -> new medium dark
      '#8B5A3C': 'ae5d29'   // Old dark -> new dark
    };
    return skinMap[skin] || 'edb98a'; // Default to most popular
  };

  // Map hair to EXACT AVATAAARS hair styles + HATS (ALL 40+ OPTIONS!)
  const mapHairStyle = (hair: string): string => {
    const hairMap: { [key: string]: string } = {
      // Common mappings (backwards compatibility)
      'long': 'straight01',              // Long -> straight01 (classic!)
      'short': 'shortFlat',              // Short -> shortFlat (sporty!)
      'curly': 'curly',                  // Curly -> curly (gorgeous!)
      'afro': 'fro',                     // Afro -> fro (beautiful!)
      'bald': 'shortFlat',               // Bald -> shortFlat (closest)
      'ponytail': 'bun',                 // Ponytail -> bun (elegant!)
      
      // ALL OFFICIAL AVATAAARS HAIR STYLES
      'straight01': 'straight01',        // Cheveux longs raides
      'straight02': 'straight02',        // Raides variante
      'bob': 'bob',                      // Carré court
      'bun': 'bun',                      // Chignon
      'curvy': 'curvy',                  // Ondulés
      'dreads': 'dreads',                // Dreadlocks
      'dreads01': 'dreads01',            // Dreads variant 1
      'dreads02': 'dreads02',            // Dreads variant 2
      'frida': 'frida',                  // Style Frida (artistic!)
      'fro': 'fro',                      // Afro (beautiful!)
      'froBand': 'froBand',              // Afro with band
      'longButNotTooLong': 'longButNotTooLong', // Mi-longs
      'miaWallace': 'miaWallace',        // Mia Wallace (iconic!)
      'shavedSides': 'shavedSides',      // Dégradé (edgy!)
      'straightAndStrand': 'straightAndStrand', // Straight with strand
      'frizzle': 'frizzle',              // Frizzled hair
      'shaggy': 'shaggy',                // Shaggy style
      'shaggyMullet': 'shaggyMullet',    // Shaggy mullet
      'shortCurly': 'shortCurly',        // Courts bouclés
      'shortFlat': 'shortFlat',          // Courts plats
      'shortRound': 'shortRound',        // Courts ronds
      'shortWaved': 'shortWaved',        // Courts ondulés
      'sides': 'sides',                  // Dégradé
      'theCaesar': 'theCaesar',          // Caesar cut
      'theCaesarAndSidePart': 'theCaesarAndSidePart', // Caesar with side part
      'bigHair': 'bigHair',              // Gros volume (dramatic!)
      
      // 🎩 HATS (now part of hair selection!) - PREMIUM
      'hat': 'hat',                      // Chapeau classique
      'hijab': 'hijab',                  // Hijab élégant
      'turban': 'turban',                // Turban royal
      'winterHat1': 'winterHat1',        // Bonnet cosy
      'winterHat02': 'winterHat02',      // Bonnet chic
      'winterHat03': 'winterHat03',      // Bonnet mode
      'winterHat04': 'winterHat04'       // Bonnet premium
    };
    return hairMap[hair] || 'straight01';
  };

  // Map hair color to EXACT AVATAAARS hex values (ALL OFFICIAL COLORS!)
  const mapHairColor = (hairColor: string): string => {
    const hairMap: { [key: string]: string } = {
      // OFFICIAL AVATAAARS FREE COLORS (no # prefix needed)
      '#a55728': 'a55728',  // Brown (most popular!)
      '#2c1b18': '2c1b18',  // Black (classic!)
      '#b58143': 'b58143',  // Light brown (warm!)
      '#d6b370': 'd6b370',  // Blonde (sunny!)
      '#724133': '724133',  // Dark brown (rich!)
      '#4a312c': '4a312c',  // Dark auburn (deep!)
      
      // OFFICIAL AVATAAARS PREMIUM COLORS
      '#f59797': 'f59797',  // Rose Gold (premium!)
      '#ecdcbf': 'ecdcbf',  // Platinum Blonde (premium!)
      '#c93305': 'c93305',  // Fire Red (premium!)
      '#e8e1e1': 'e8e1e1',  // Silver White (premium!)
      
      // Backwards compatibility (map to closest official color)
      '#FFD700': 'd6b370',  // Old blonde -> new blonde
      '#8B4513': 'a55728',  // Old brown -> new brown
      '#000000': '2c1b18',  // Old black -> new black
      '#FF0000': 'c93305',  // Old red -> new fire red
      '#D2691E': 'b58143',  // Old auburn -> new light brown
      '#654321': '724133'   // Old dark brown -> new dark brown
    };
    return hairMap[hairColor] || 'a55728'; // Default to brown
  };

  // Map eyes to ALL AVATAAARS eye expressions (12 OPTIONS!)
  const mapEyes = (eyes: string): string => {
    // If the input is already a valid AVATAAARS eye style, use it directly
    const validEyeStyles = ['closed', 'cry', 'default', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'winkWacky', 'wink', 'xDizzy'];
    if (validEyeStyles.includes(eyes)) {
      return eyes;
    }
    
    // Map from text or hex color to expressions
    const eyeMap: { [key: string]: string } = {
      // ALL OFFICIAL AVATAAARS EYE EXPRESSIONS
      'closed': 'closed',             // Closed eyes (peaceful!)
      'cry': 'cry',                   // Crying (emotional!)
      'default': 'default',           // Default (natural!)
      'eyeRoll': 'eyeRoll',          // Eye roll (attitude!)
      'happy': 'happy',               // Happy (super cute!)
      'hearts': 'hearts',             // Hearts (in love!)
      'side': 'side',                 // Side glance (flirty!)
      'squint': 'squint',             // Squint (sassy!)
      'surprised': 'surprised',       // Surprised (amazed!)
      'winkWacky': 'winkWacky',      // Wacky wink (fun!)
      'wink': 'wink',                 // Wink (playful!)
      'xDizzy': 'xDizzy',            // Dizzy X eyes (funny!)
      
      // Legacy mappings
      'glasses': 'default',           // Glasses -> default (we'll add glasses via accessories)
      'sleep': 'closed',              // Sleep -> closed (peaceful!)
      'sunglasses': 'default',        // Sunglasses -> default (we'll add sunglasses via accessories)
      
      // Hex color mappings (backwards compatibility)
      '#4169E1': 'wink',              // Blue -> wink
      '#228B22': 'happy',             // Green -> happy
      '#8B4513': 'default',           // Brown -> default
      '#808080': 'default',           // Gray -> default (glasses via accessories)
      '#000000': 'default',           // Black -> default
      '#333333': 'default'            // Dark gray -> default
    };
    return eyeMap[eyes] || 'happy';
  };

  // Map eyebrows to ALL AVATAAARS eyebrow styles (13 OPTIONS!)
  const mapEyebrows = (eyebrows?: string): string => {
    if (!eyebrows) return 'defaultNatural'; // Default if not provided
    
    const eyebrowMap: { [key: string]: string } = {
      // Common mappings (backwards compatibility)
      'natural': 'defaultNatural',           // Natural -> defaultNatural (most popular!)
      'raised': 'raisedExcitedNatural',      // Raised -> raisedExcitedNatural (excited!)
      'flat': 'flatNatural',                 // Flat -> flatNatural (calm)
      'angry': 'angryNatural',               // Angry -> angryNatural (dramatic!)
      'sad': 'sadConcernedNatural',          // Sad -> sadConcernedNatural (concerned)
      'unibrow': 'unibrowNatural',           // Unibrow -> unibrowNatural (unique!)
      
      // ALL OFFICIAL AVATAAARS EYEBROW STYLES (NATURAL - more bushy)
      'angryNatural': 'angryNatural',        // Angry natural (dramatic!)
      'defaultNatural': 'defaultNatural',    // Default natural (most popular!)
      'flatNatural': 'flatNatural',          // Flat natural (calm)
      'frownNatural': 'frownNatural',        // Frown natural (serious)
      'raisedExcitedNatural': 'raisedExcitedNatural', // Raised excited natural
      'sadConcernedNatural': 'sadConcernedNatural',   // Sad concerned natural
      'unibrowNatural': 'unibrowNatural',    // Unibrow natural (unique!)
      'upDownNatural': 'upDownNatural',      // Asymmetric natural
      
      // SIMPLIFIED STYLES (less bushy)
      'default': 'default',                  // Simple default
      'raisedExcited': 'raisedExcited',      // Simple raised excited
      'sadConcerned': 'sadConcerned',        // Simple sad concerned
      'upDown': 'upDown'                     // Simple asymmetric
    };
    return eyebrowMap[eyebrows] || 'defaultNatural';
  };

  // Map outfit to ALL AVATAAARS clothing (9 COMPLETE OUTFITS!)
  const mapOutfit = (outfit: string): string => {
    const outfitMap: { [key: string]: string } = {
      // Backwards compatibility ONLY for different names
      'dress': 'blazerAndShirt',      // Dress → blazer+shirt combo (elegant business look!)
      'tshirt': 'shirtCrewNeck',      // T-shirt → basic crew neck (casual!)
      'formal': 'blazerAndSweater',   // Formal → blazer+sweater combo (professional!)
      'sport': 'shirtVNeck',          // Sport → v-neck shirt (active!)
      'elegant': 'collarAndSweater',  // Elegant → collar+sweater combo (classy!)
      'graphic': 'graphicShirt',      // Graphic tee → allows designs!
      
      // ALL OFFICIAL AVATAAARS CLOTHING STYLES (no duplicates)
      'blazerAndShirt': 'blazerAndShirt',       // Blazer + shirt (professional!)
      'blazerAndSweater': 'blazerAndSweater',   // Blazer + sweater (elegant!)
      'collarAndSweater': 'collarAndSweater',   // Collar + sweater (classy!)
      'graphicShirt': 'graphicShirt',           // Graphic shirt (for designs!)
      'hoodie': 'hoodie',                       // Hoodie (comfy!)
      'overall': 'overall',                     // Overall (cute!)
      'shirtCrewNeck': 'shirtCrewNeck',         // Crew neck shirt (casual!)
      'shirtScoopNeck': 'shirtScoopNeck',       // Scoop neck (feminine!)
      'shirtVNeck': 'shirtVNeck'                // V-neck shirt (sporty!)
    };
    return outfitMap[outfit] || 'shirtCrewNeck';
  };

  // Map outfit graphic (NEW! Only works with graphicShirt)
  const mapOutfitGraphic = (outfitGraphic?: string): string[] => {
    if (!outfitGraphic || outfitGraphic === 'none') {
      return []; // No graphic
    }
    
    const graphicMap: { [key: string]: string } = {
      'bear': 'bear',           // Bear design (cute!)
      'pizza': 'pizza',         // Pizza design (fun!)
      'skull': 'skull',         // Skull design (edgy!)
      'diamond': 'diamond',     // Diamond design (sparkly!)
      'bat': 'bat',             // Bat design (gothic!)
      'deer': 'deer',           // Deer design (nature!)
      'hola': 'hola',           // Hola text (friendly!)
      'resist': 'resist',       // Resist text (activist!)
      'cumbia': 'cumbia',       // Cumbia text (music!)
      'skullOutline': 'skullOutline' // Skull outline (subtle!)
    };
    
    return graphicMap[outfitGraphic] ? [graphicMap[outfitGraphic]] : [];
  };

  // Map accessory color to EXACT AVATAAARS hex values (ALL OFFICIAL COLORS!)
  const mapAccessoryColor = (accessoryColor?: string): string => {
    if (!accessoryColor) {
      console.log('🔍 Default accessory color: dark navy');
      return '262e33'; // Default to dark navy (NOT black!)
    }
    
    const colorMap: { [key: string]: string } = {
      // OFFICIAL AVATAAARS FREE COLORS (no # prefix needed)
      '#262e33': '262e33',  // Dark navy (classic!)
      '#5199e4': '5199e4',  // Blue (stylish!)
      '#ffafb9': 'ffafb9',  // Pink (girly!)
      '#ffffb1': 'ffffb1',  // Yellow (fun!)
      '#929598': '929598',  // Gray (neutral!)
      '#ffffff': 'ffffff',  // White (clean!)
      
      // OFFICIAL AVATAAARS PREMIUM COLORS
      '#ff488e': 'ff488e',  // Hot Pink Glow (premium!)
      '#ff5c5c': 'ff5c5c',  // Neon Red Glow (premium!)
      '#a7ffc4': 'a7ffc4',  // Mint Glow (premium!)
      '#ffdeb5': 'ffdeb5',  // Golden Shine (premium!)
      
      // Backwards compatibility (map to closest official color)
      '#000000': '262e33',  // Old black -> new dark navy
      '#3b82f6': '5199e4',  // Old blue -> new blue
      '#ec4899': 'ff488e',  // Old pink -> new hot pink
      '#fbbf24': 'ffffb1',  // Old yellow -> new yellow
      '#8b5cf6': '5199e4'   // Old purple -> new blue
    };
    
    console.log('🔍 Custom accessory color:', accessoryColor, '→', colorMap[accessoryColor] || '262e33');
    return colorMap[accessoryColor] || '262e33'; // Default to dark navy
  };

  // Map accessories to exact AVATAAARS values
  const mapAccessories = (character: Character): string[] => {
    // Use the newer 'accessories' field, fallback to old 'accessory'
    const accessoryValue = (character as any).accessories || character.accessory || 'none';
    
    if (accessoryValue === 'none') {
      return []; // No accessories
    }
    
    const accessoryMap: { [key: string]: string } = {
      // Direct official mappings (EXACT from schema!)
      'prescription01': 'prescription01', // Basic glasses (should work!)
      'prescription02': 'prescription02', // Designer glasses
      'sunglasses': 'sunglasses',         // Sunglasses
      'round': 'round',                   // Round glasses
      'wayfarers': 'wayfarers',           // Wayfarers
      'kurt': 'kurt',                     // Kurt style
      'eyepatch': 'eyepatch',             // Pirate patch
      
      // Legacy mappings for backwards compatibility
      'glasses': 'prescription01',        // Legacy → prescription01
      'none': ''                          // None → empty
    };
    
    const mappedAccessory = accessoryMap[accessoryValue] || accessoryValue;
    return mappedAccessory ? [mappedAccessory] : [];
  };

  // Map mouth to cute expressions (NEW!)
  const mapMouth = (mouth?: string): string => {
    if (!mouth) return 'smile'; // Default to smile if not provided
    
    const mouthMap: { [key: string]: string } = {
      'smile': 'smile',           // Smile -> smile (cute!)
      'twinkle': 'twinkle',       // Mischievous -> twinkle (girly!)
      'default': 'default',       // Normal -> default (natural!)
      'serious': 'serious',       // Serious -> serious (professional!)
      'tongue': 'tongue',         // Tongue Out -> tongue (playful!)
      'concerned': 'concerned',   // Concerned -> concerned (worried!)
      'disbelief': 'disbelief',   // Disbelief -> disbelief (shocked!)
      'eating': 'eating',         // Eating -> eating (fun!)
      'grimace': 'grimace',       // Grimace -> grimace (oops!)
      'screamOpen': 'screamOpen', // Scream -> screamOpen (dramatic!)
      'vomit': 'vomit'            // Sick -> vomit (sick!)
    };
    return mouthMap[mouth] || 'smile';
  };

  // Map outfit color to EXACT AVATAAARS hex values (ALL OFFICIAL COLORS!)
  const mapOutfitColor = (outfitColor?: string): string => {
    if (!outfitColor) return '5199e4'; // Default to blue
    
    const colorMap: { [key: string]: string } = {
      // OFFICIAL AVATAAARS FREE COLORS (no # prefix needed)
      '#65c9ff': '65c9ff',  // Sky blue (dreamy!)
      '#5199e4': '5199e4',  // Blue (professional!)
      '#b1e2ff': 'b1e2ff',  // Pastel blue (cute!)
      '#a7ffc4': 'a7ffc4',  // Mint green (fresh!)
      '#ffafb9': 'ffafb9',  // Pastel pink (adorable!)
      '#ffffb1': 'ffffb1',  // Pale yellow (sunny!)
      '#e6e6e6': 'e6e6e6',  // Light gray (minimalist!)
      '#ffffff': 'ffffff',  // White (clean!)
      
      // OFFICIAL AVATAAARS PREMIUM COLORS
      '#ff488e': 'ff488e',  // Hot Pink (premium!)
      '#ff5c5c': 'ff5c5c',  // Neon Red (premium!)
      '#3c4f5c': '3c4f5c',  // Midnight Blue (premium!)
      '#ffdeb5': 'ffdeb5',  // Peach Cream (premium!)
      
      // Backwards compatibility (map to closest official color)
      '#ec4899': 'ff488e',  // Old pink -> new hot pink
      '#93c5fd': '65c9ff',  // Old pastel blue -> new sky blue
      '#f9a8d4': 'ffafb9',  // Old pastel pink -> new pastel pink
      '#3b82f6': '5199e4',  // Old blue -> new blue
      '#34d399': 'a7ffc4',  // Old green -> new mint green
      '#fbbf24': 'ffffb1',  // Old yellow -> new pale yellow
      '#8b5cf6': '5199e4',  // Old purple -> new blue
      '#f59e0b': 'ff488e'   // Old orange -> new hot pink
    };
    return colorMap[outfitColor] || '5199e4'; // Default to blue
  };

  // Build the AVATAAARS options (PERFECT DOLL!)
  return {
    // Basic avatar structure
    base: ['default'], // Default base
    
    // Skin
    skinColor: [mapSkinColor(character.skin)],
    
    // Hair and Hats (IMPORTANT: hat overrides hair!)
    top: [mapHairStyle(character.hair)], // Hair OR hat (merged!)
    hairColor: [mapHairColor(character.hairColor)], // Used for both hair AND hat colors
    
    // Face features (CUTE!)
    eyes: [mapEyes(character.eyes)],
    eyebrows: [mapEyebrows((character as any).eyebrows)],
    mouth: [mapMouth((character as any).mouth)],
    
    // Clothing (COMPLETE OUTFITS!)
    clothing: [mapOutfit(character.outfit)],
    clothesColor: [mapOutfitColor((character as any).outfitColor)],
    clothingGraphic: mapOutfitGraphic((character as any).outfitGraphic), // NEW: T-shirt designs!
    
    // Accessories (DETAILS!)
    accessories: mapAccessories(character),
    accessoriesColor: [mapAccessoryColor((character as any).accessoryColor)],
    accessoriesProbability: 100, // FORCE accessories to show when selected!
    
    // No facial hair for feminine look
    facialHair: [],
    facialHairProbability: 0
  };
};

// Generate a unique seed for consistent avatars
export const generateAvatarSeed = (character: Character): string => {
  return `doll-${character.skin}-${character.hair}-${character.hairColor}-${character.eyes}-${character.outfit}`;
};

// GIRLY DOLL character presets for testing (PERFECT AVATAAARS MAPPING!)
export const GIRLY_CHARACTER_PRESETS: Character[] = [
  {
    skin: '#FDBCB4',       // -> f2d3d1 (lightest)
    hair: 'long',          // -> straight01 (classic!)
    hairColor: '#FFD700',  // -> f59e0b (blonde)
    eyebrowColor: '#FFD700', // Keep for backwards compatibility
    eyebrows: 'natural',   // -> defaultNatural (perfect!)
    eyes: 'happy',         // -> happy (super cute!)
    mouth: 'smile',        // -> smile (cute!)
    outfit: 'dress',       // -> blazerAndShirt (elegant!)
    outfitColor: '#ec4899', // Pink (feminine!)
    outfitGraphic: 'none', // No graphic
    hat: 'none',           // No hat - show hair
    hatColor: '#000000',   // Default
    shoes: 'heels',        // Keep for backwards compatibility
    accessory: 'none',     // Keep for backwards compatibility
    accessories: 'none',   // -> [] (clean!)
    accessoryColor: '#000000', // Black
    level: 5,
    endolots: 300,
    healthPoints: 100
  },
  {
    skin: '#E8B98A',       // -> f1c3a7 (golden)
    hair: 'curly',         // -> curly (gorgeous!)
    hairColor: '#8B4513',  // -> 92400e (brown)
    eyebrowColor: '#8B4513',
    eyebrows: 'raised',    // -> raisedExcited (excited!)
    eyes: 'wink',          // -> wink (playful!)
    mouth: 'twinkle',      // -> twinkle (girly!)
    outfit: 'elegant',     // -> collarAndSweater (classy!)
    outfitColor: '#fbbf24', // Yellow (sunny!)
    outfitGraphic: 'none', // No graphic
    hat: 'hijab',          // Hijab (inclusive!)
    hatColor: '#8b5cf6',   // Purple hijab
    shoes: 'heels',
    accessory: 'earrings',
    accessories: 'none',   // -> [] (clean look!)
    accessoryColor: '#fbbf24', // Yellow to match outfit
    level: 8,
    endolots: 500,
    healthPoints: 100
  },
  {
    skin: '#C89666',       // -> e8b98a (medium)
    hair: 'ponytail',      // -> bun (elegant!)
    hairColor: '#000000',  // -> 1f2937 (black)
    eyebrowColor: '#000000',
    eyebrows: 'natural',   // -> defaultNatural (classic!)
    eyes: 'default',       // -> default (natural!)
    mouth: 'serious',      // -> serious (professional!)
    outfit: 'graphic',     // -> graphicShirt (with design!)
    outfitColor: '#34d399', // Green (fresh!)
    outfitGraphic: 'bear', // Bear design (cute!)
    hat: 'none',           // No hat
    hatColor: '#000000',   // Default
    shoes: 'sneakers',
    accessory: 'glasses',
    accessories: 'glasses', // -> ['prescription01'] (smart!)
    accessoryColor: '#000000', // Black glasses
    level: 3,
    endolots: 200,
    healthPoints: 100
  },
  {
    skin: '#8B5A3C',       // -> 8b5a3c (dark)
    hair: 'short',         // -> bob (modern girly!)
    hairColor: '#FF0000',  // -> dc2626 (red)
    eyebrowColor: '#FF0000',
    eyebrows: 'flat',      // -> flatNatural (calm!)
    eyes: 'default',       // -> default (natural!)
    mouth: 'tongue',       // -> tongue (playful!)
    outfit: 'formal',      // -> blazerAndSweater (professional!)
    outfitColor: '#3b82f6', // Blue (professional!)
    outfitGraphic: 'none', // No graphic
    hat: 'winterHat1',     // Winter beanie (cozy!)
    hatColor: '#ec4899',   // Pink beanie
    shoes: 'heels',
    accessory: 'sunglasses',
    accessories: 'sunglasses', // -> ['sunglasses'] (cool!)
    accessoryColor: '#000000', // Black sunglasses
    level: 7,
    endolots: 450,
    healthPoints: 100
  }
]; 