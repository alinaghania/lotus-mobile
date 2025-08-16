import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { Character } from '../types/character';
import { mapCharacterToAvataaars, generateAvatarSeed } from '../utils/diceBearUtils';

interface DetailedCharacterProps {
  character: Character;
  size?: number;
}

export default function DetailedCharacter({ character, size = 100 }: DetailedCharacterProps) {
  
  // Generate the PERFECT DOLL avatar using DiceBear AVATAAARS 💅
  const generateAvatar = () => {
    try {
      const options = mapCharacterToAvataaars(character);
      const seed = generateAvatarSeed(character);

      // Generate avatar with options

      const avatar = createAvatar(avataaars, {
        seed,
        ...options,
        size: size * 2, // High quality internal rendering
        backgroundColor: ['transparent'],
        // Perfect positioning for full body cute avatars
        scale: 85, // Slightly zoom out to see full avatar
        translateY: 0, // Perfect centering
        translateX: 0, // Perfect centering
      });

      return avatar.toString();
    } catch (error) {
      console.error('❌ Error generating AVATAAARS doll avatar:', error);

      // Fallback: Simple cute fallback if avatar generation fails
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-5}" fill="${character.skin}" stroke="#ffb6c1" stroke-width="3"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" dy="0.35em" font-size="${size/4}" fill="white">👩‍🦰</text>
      </svg>`;
    }
  };

  const avatarSvg = generateAvatar();

  return (
    <View style={{ 
      width: size, 
      height: size, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'transparent' 
    }}>
      <SvgXml 
        xml={avatarSvg} 
        width={size} 
        height={size}
        style={{ 
          backgroundColor: 'transparent'
        }}
      />
    </View>
  );
} 