import React from 'react';
import { Character } from '../types/character';

interface DetailedCharacterProps {
  character: Character;
  size?: number;
}

const DetailedCharacter: React.FC<DetailedCharacterProps> = ({ character, size = 200 }) => {
  // Utiliser un id unique pour éviter les conflits de gradient si plusieurs composants sont rendus
  const gradientIdSuffix = Math.random().toString(36).substring(2, 7);
  const skinGradient = `skinGradient-${gradientIdSuffix}`;
  const hairGradient = `hairGradient-${gradientIdSuffix}`;
  const topGradient = `topGradient-${gradientIdSuffix}`;

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
        <defs>
          <linearGradient id={skinGradient} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={character.skinTone} />
            <stop offset="100%" stopColor={character.skinTone + 'CC'} />
          </linearGradient>
          <linearGradient id={hairGradient} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={character.hairColor} />
            <stop offset="100%" stopColor={character.hairColor + 'DD'} />
          </linearGradient>
          <linearGradient id={topGradient} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C42" />
            <stop offset="50%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#F4845F" />
          </linearGradient>
        </defs>

        {/* ---- SVG complet repris de l'ancienne implémentation ---- */}
        <g>
          {/* Cheveux (plusieurs styles) */}
          {character.hairStyle === 'long' && (
            <g>
              {/* Long carré (shoulder length bob) */}
              <path d="M60 60 Q60 35 100 35 Q140 35 140 60 L140 110 Q130 120 70 120 L60 110 Z" fill={character.hairColor} />
              {/* Slight curve bottom */}
              <path d="M60 110 Q100 125 140 110" stroke="#000" strokeWidth="1" opacity="0.2" fill="none" />
            </g>
          )}
          {character.hairStyle === 'short' && (
            <g>
              <path d="M65 65 Q65 45 100 40 Q135 45 135 65 Q135 80 130 85 Q115 90 100 88 Q85 90 70 85 Q65 80 65 65 Z" fill={`url(#${hairGradient})`} />
              <path d="M75 70 Q80 65 85 70" stroke={character.hairColor} strokeWidth="1" fill="none" opacity="0.7" />
              <path d="M115 70 Q120 65 125 70" stroke={character.hairColor} strokeWidth="1" fill="none" opacity="0.7" />
            </g>
          )}

          {character.hairStyle === 'ponytail' && (
            <g>
              <ellipse cx="100" cy="70" rx="38" ry="35" fill={`url(#${hairGradient})`} />
              <ellipse cx="138" cy="75" rx="8" ry="20" fill={`url(#${hairGradient})`} transform="rotate(20 138 75)" />
              <ellipse cx="135" cy="70" rx="10" ry="4" fill="#FF6B35" transform="rotate(20 135 70)" />
              <path d="M70 65 Q100 55 130 65" stroke={character.hairColor} strokeWidth="2" fill="none" opacity="0.6" />
            </g>
          )}

          {character.hairStyle === 'curly' && (
            <g>
              {/* Base head cap */}
              <circle cx="100" cy="70" r="40" fill={character.hairColor} />
              {/* Ring of small circles to mimic curls */}
              {Array.from({length:16}).map((_,idx)=>{
                const angle = (Math.PI*2/16)*idx;
                const r = 46; // slightly outside main circle
                const x = 100 + r*Math.cos(angle);
                const y = 70 + r*Math.sin(angle);
                return <circle key={idx} cx={x} cy={y} r="6" fill={character.hairColor} />;
              })}
            </g>
          )}

          {character.hairStyle === 'braids' && (
            <g>
              <ellipse cx="100" cy="70" rx="38" ry="35" fill={`url(#${hairGradient})`} />
              <g>
                <path d="M70 80 Q65 90 68 100 Q70 110 65 120" stroke={`url(#${hairGradient})`} strokeWidth="8" fill="none" />
                <circle cx="68" cy="85" r="3" fill={character.hairColor} opacity="0.8" />
                <circle cx="67" cy="95" r="3" fill={character.hairColor} opacity="0.8" />
                <circle cx="68" cy="105" r="3" fill={character.hairColor} opacity="0.8" />
              </g>
              <g>
                <path d="M130 80 Q135 90 132 100 Q130 110 135 120" stroke={`url(#${hairGradient})`} strokeWidth="8" fill="none" />
                <circle cx="132" cy="85" r="3" fill={character.hairColor} opacity="0.8" />
                <circle cx="133" cy="95" r="3" fill={character.hairColor} opacity="0.8" />
                <circle cx="132" cy="105" r="3" fill={character.hairColor} opacity="0.8" />
              </g>
            </g>
          )}

          {character.hairStyle === 'bob' && (
            <g>
              <path d="M70 65 Q70 45 100 40 Q130 45 130 65 Q130 85 125 90 Q100 95 75 90 Q70 85 70 65 Z" fill={`url(#${hairGradient})`} />
              <path d="M75 85 Q100 90 125 85" stroke={character.hairColor} strokeWidth="1.5" fill="none" opacity="0.5" />
            </g>
          )}

          {character.hairStyle === 'pixie' && (
            <g>
              <path d="M75 68 Q100 45 125 68 Q125 75 120 78 Q100 80 80 78 Q75 75 75 68 Z" fill={`url(#${hairGradient})`} />
              <path d="M85 70 Q90 68 95 70" stroke={character.hairColor} strokeWidth="1.5" fill="none" opacity="0.7" />
              <path d="M105 70 Q110 68 115 70" stroke={character.hairColor} strokeWidth="1.5" fill="none" opacity="0.7" />
            </g>
          )}

          {character.hairStyle === 'waves' && (
            <g>
              {/* Base cap */}
              <path d="M60 60 Q80 30 100 30 Q120 30 140 60 Q140 100 60 100 Z" fill={character.hairColor} />
              {/* Layered waves */}
              {Array.from({length:4}).map((_,idx)=>{
                const y=65+idx*8;
                return <path key={idx} d={`M70 ${y} q10 -6 20 0 q10 6 20 0 q10 -6 20 0`} stroke="#fff" strokeOpacity="0.4" strokeWidth="2" fill="none" />;
              })}
            </g>
          )}

          {character.hairStyle === 'bun' && (
            <g>
              <ellipse cx="100" cy="70" rx="35" ry="30" fill={`url(#${hairGradient})`} />
              <circle cx="100" cy="55" r="12" fill={`url(#${hairGradient})`} />
              <circle cx="100" cy="55" r="8" fill={character.hairColor} opacity="0.8" />
              <path d="M75 65 Q100 50 125 65" stroke={character.hairColor} strokeWidth="1.5" fill="none" opacity="0.6" />
            </g>
          )}

          {character.hairStyle === 'mohawk' && (
            <g>
              {/* Shaved sides */}
              <path d="M60 60 Q60 40 100 40 Q140 40 140 60 Q140 80 60 80 Z" fill="#B1A7A6" opacity="0.3" />
              {/* Tall crest */}
              <path d="M95 25 L105 25 L108 80 L92 80 Z" fill={character.hairColor} />
            </g>
          )}

          {character.hairStyle === 'afro' && (
            <g>
              <circle cx="100" cy="70" r="45" fill={`url(#${hairGradient})`} />
              {/* Petites mèches */}
              <circle cx="80" cy="60" r="8" fill={character.hairColor} opacity="0.7" />
              <circle cx="120" cy="60" r="8" fill={character.hairColor} opacity="0.7" />
              <circle cx="90" cy="45" r="6" fill={character.hairColor} opacity="0.8" />
              <circle cx="110" cy="45" r="6" fill={character.hairColor} opacity="0.8" />
            </g>
          )}

          {character.hairStyle === 'bangs' && (
            <g>
              {/* Central cap */}
              <path d="M60 60 Q60 40 100 35 Q140 40 140 60 Q140 70 135 80 Q65 80 60 70 Z" fill={character.hairColor} />
              {/* Two braids downwards */}
              <path d="M70 80 Q65 110 70 140" stroke={character.hairColor} strokeWidth="14" strokeLinecap="round" />
              <path d="M130 80 Q135 110 130 140" stroke={character.hairColor} strokeWidth="14" strokeLinecap="round" />
            </g>
          )}

          {/* Visage */}
          <ellipse cx="100" cy="80" rx="32" ry="35" fill={`url(#${skinGradient})`} stroke="#000" strokeWidth="0.5" />

          {/* Yeux */}
          <ellipse cx="88" cy="75" rx="5" ry="7" fill="white" stroke="#000" strokeWidth="0.3" />
          <ellipse cx="112" cy="75" rx="5" ry="7" fill="white" stroke="#000" strokeWidth="0.3" />
          <circle cx="88" cy="76" r="3.5" fill={character.eyeColor} />
          <circle cx="112" cy="76" r="3.5" fill={character.eyeColor} />
          <circle cx="89" cy="74" r="1.2" fill="white" />
          <circle cx="113" cy="74" r="1.2" fill="white" />

          {/* Sourcils (plus épais) */}
          <path d="M83 67 Q88 65 93 67" stroke={character.eyebrowColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M107 67 Q112 65 117 67" stroke={character.eyebrowColor} strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Nez */}
          <path d="M98 81 Q100 84 102 81" stroke="#000" strokeWidth="1" fill="none" />

          {/* Bouche selon expression */}
          {character.expression === 'happy' && <path d="M90 90 Q100 97 110 90" stroke="#000" strokeWidth="2" fill="none" />}
          {character.expression === 'neutral' && <line x1="95" y1="92" x2="105" y2="92" stroke="#000" strokeWidth="2" />}
          {character.expression === 'excited' && (
            <ellipse cx="100" cy="92" rx="10" ry="5" fill="#FF69B4" stroke="#000" strokeWidth="1" />
          )}
          {character.expression === 'calm' && (
            <path d="M93 90 Q100 94 107 90" stroke="#000" strokeWidth="2" fill="none" />
          )}
          {character.expression === 'sleepy' && (
            <g>
              <path d="M85 75 Q88 73 91 75" stroke="#000" strokeWidth="2" fill="none" />
              <path d="M109 75 Q112 73 115 75" stroke="#000" strokeWidth="2" fill="none" />
              <path d="M96 90 Q100 88 104 90" stroke="#000" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Accessoires (exemple lunettes) */}
          {character.accessory === 'glasses' && (
            <g>
              <circle cx="88" cy="75" r="10" fill="none" stroke="#333" strokeWidth="2.5" />
              <circle cx="112" cy="75" r="10" fill="none" stroke="#333" strokeWidth="2.5" />
              <line x1="98" y1="75" x2="102" y2="75" stroke="#333" strokeWidth="2.5" />
            </g>
          )}
          {character.accessory === 'hat' && (
            <g>
              <ellipse cx="100" cy="45" rx="35" ry="12" fill="#4B0082" />
              <ellipse cx="100" cy="35" rx="25" ry="20" fill="#4B0082" />
              <ellipse cx="100" cy="33" rx="22" ry="17" fill="#6A5ACD" />
            </g>
          )}
          {character.accessory === 'earrings' && (
            <g>
              <circle cx="68" cy="85" r="4" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
              <circle cx="132" cy="85" r="4" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
            </g>
          )}
          {character.accessory === 'necklace' && (
            <ellipse cx="100" cy="115" rx="22" ry="6" fill="none" stroke="#FFD700" strokeWidth="3" />
          )}
          {character.accessory === 'bow' && (
            <g>
              <path d="M88 45 Q100 40 112 45 Q108 35 100 40 Q92 35 88 45" fill="#FF69B4" />
              <path d="M94 42 Q100 39 106 42 Q103 37 100 39 Q97 37 94 42" fill="#FFB6C1" />
              <circle cx="100" cy="42" r="2.5" fill="#FFD700" />
            </g>
          )}

          {/* Corps (haut + bas) */}
          <rect x="85" y="115" width="30" height="40" rx="15" fill={character.skinTone} />
          <rect x="82" y="118" width="36" height="25" rx="10" fill={character.topColor} />
          <rect x="85" y="140" width="30" height="35" rx="5" fill={character.bottomColor} />

          {/* Chaussures */}
          <rect x="78" y="175" width="15" height="8" rx="2" fill={character.shoeColor} />
          <rect x="107" y="175" width="15" height="8" rx="2" fill={character.shoeColor} />

          {/* Bras */}
          <ellipse cx="75" cy="130" rx="8" ry="15" fill={character.skinTone} />
          <ellipse cx="125" cy="130" rx="8" ry="15" fill={character.skinTone} />
        </g>
      </svg>
    </div>
  );
};

export default DetailedCharacter; 