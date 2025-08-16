import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DetailedCharacter from '../components/DetailedCharacter';
import { Character } from '../types/character';
import { 
  customizationSteps, 
  premiumOptions,
  PremiumOption
} from '../constants/customizationOptions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { characterStyles } from '../styles/characterCustomizationStyles';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;

// Storage functions for character
const saveCharacterToStorage = async (character: Character) => {
  try {
    const characterData = JSON.stringify(character);
    await AsyncStorage.setItem('savedCharacter', characterData);
    console.log('Character saved successfully:', character);
    return true;
  } catch (error) {
    console.error('Failed to save character:', error);
    return false;
  }
};

const loadSavedCharacter = async (): Promise<Character> => {
  try {
    const characterData = await AsyncStorage.getItem('savedCharacter');
    if (characterData) {
      const savedCharacter = JSON.parse(characterData);
      console.log('Loaded character from storage:', savedCharacter);
      // Ensure all required properties exist (backwards compatibility + AVATAAARS support)
      return {
        ...savedCharacter,
        eyebrowColor: savedCharacter.eyebrowColor || savedCharacter.hairColor || '#8B4513',
        eyebrows: savedCharacter.eyebrows || 'natural',
        eyes: savedCharacter.eyes || 'happy',
        mouth: savedCharacter.mouth || 'smile',
        shoes: savedCharacter.shoes || 'sneakers',
        accessory: savedCharacter.accessory || 'none',
        accessories: savedCharacter.accessories || 'none',
        outfitColor: savedCharacter.outfitColor || '#93c5fd',
        outfitGraphic: savedCharacter.outfitGraphic || 'none',
        hat: savedCharacter.hat || 'none',
        hatColor: savedCharacter.hatColor || '#000000',
        accessoryColor: savedCharacter.accessoryColor || '#000000',
        endolots: savedCharacter.endolots || 150,
        healthPoints: savedCharacter.healthPoints || 100
      };
    }
  } catch (error) {
    console.error('Failed to load character:', error);
  }
  
  // Return default AVATAAARS character if no saved character found
  return {
    skin: '#F1C3A7',
    hair: 'long',
    hairColor: '#8B4513',
    eyebrowColor: '#8B4513',
    eyebrows: 'natural',
    eyes: 'happy',
    mouth: 'smile',
    outfit: 'tshirt',
    outfitColor: '#93c5fd',
    outfitGraphic: 'none',
    hat: 'none',
    hatColor: '#000000',
    shoes: 'sneakers',
    accessory: 'none',
    accessories: 'none',
    accessoryColor: '#000000',
    level: 1,
    endolots: 150,
    healthPoints: 100
  };
};

const purchasePremiumItem = (stepKey: string, value: string, cost: number, character: Character) => {
  // TODO: Implement actual purchase functionality
  return (character.endolots || 0) >= cost;
};

const isPremiumItemPurchased = (stepKey: string, value: string) => {
  // TODO: Implement purchased check
  return false;
};

interface CharacterCustomizationProps {
  character?: Character;
  setCharacter?: (character: Character) => void;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  setCurrentPage?: (page: string) => void;
}

export default function CharacterCustomizationScreen() {
  const navigation = useNavigation();
  
  // Local state for character customization - AVATAAARS compatible!
  const [character, setCharacter] = useState<Character>({
    skin: '#F1C3A7',
    hair: 'long',
    hairColor: '#8B4513',
    eyebrowColor: '#8B4513',
    eyebrows: 'natural',
    eyes: 'happy',
    mouth: 'smile',
    outfit: 'tshirt',
    outfitColor: '#93c5fd',
    outfitGraphic: 'none',
    hat: 'none',
    hatColor: '#000000',
    shoes: 'sneakers',
    accessory: 'none',
    accessories: 'none',
    accessoryColor: '#000000',
    level: 1,
    endolots: 150,
    healthPoints: 100
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [previewItem, setPreviewItem] = useState<{option: PremiumOption, stepKey: string} | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load saved character on component mount
  useEffect(() => {
    const loadCharacter = async () => {
      const savedCharacter = await loadSavedCharacter();
      setCharacter(savedCharacter);
    };
    
    loadCharacter();
  }, []);

  const step = customizationSteps[currentStep];
  const isLastStep = currentStep === customizationSteps.length - 1;
  const currentEndolots = character.endolots || 0;

  // 🎯 CONDITIONAL LOGIC: Filter steps based on current character state
  const getFilteredSteps = () => {
    return customizationSteps.filter(step => {
      // T-shirt Design: only show if graphicShirt is selected
      if (step.key === 'outfitGraphic') {
        return character.outfit === 'graphicShirt';
      }
      
      // Accessory Color: only show if accessories are selected (not 'none')
      if (step.key === 'accessoryColor') {
        return character.accessories && character.accessories !== 'none';
      }
      
      // All other steps are always shown (hats now merged with hair)
      return true;
    });
  };

  const filteredSteps = getFilteredSteps();
  const filteredStep = filteredSteps[currentStep];
  const isLastFilteredStep = currentStep === filteredSteps.length - 1;

  // Debug logs
  console.log('🔍 Current step:', currentStep, filteredStep?.title);
  console.log('🔍 Current character:', character);
  console.log('🔍 Total filtered steps:', filteredSteps.length, 'of', customizationSteps.length);
  console.log('🔍 Filtered steps:', filteredSteps.map(s => s.key).join(', '));

  // Safety check - if step is undefined, reset to first step
  if (!filteredStep && filteredSteps.length > 0) {
    console.log('⚠️ Filtered step undefined, resetting to first step');
    setCurrentStep(0);
    return null; // Return null to trigger re-render
  }

  // If no steps are available, show error
  if (filteredSteps.length === 0) {
    return (
      <SafeAreaView style={characterStyles.errorContainer}>
        <Text style={characterStyles.errorText}>Error: No customization steps available!</Text>
      </SafeAreaView>
    );
  }

  // Get premium options for current filtered step
  const currentPremiumOptions = premiumOptions[filteredStep.key as keyof typeof premiumOptions] || [];

  const handleOptionClick = async (value: string) => {
    console.log('🎯 Updating character:', filteredStep.key, '=', value);
    console.log('🎯 Before update - hairColor:', character.hairColor, 'accessoryColor:', character.accessoryColor);
    
    const updatedCharacter = {
      ...character,
      [filteredStep.key]: value,
    };
    
    // Special handling for backwards compatibility
    if (filteredStep.key === 'eyebrows') {
      // Update both eyebrows and eyebrowColor for compatibility
      updatedCharacter.eyebrows = value;
      updatedCharacter.eyebrowColor = character.hairColor; // Match hair color
    }
    if (filteredStep.key === 'accessories') {
      // Update both accessories and accessory for compatibility  
      updatedCharacter.accessories = value;
      updatedCharacter.accessory = value === 'none' ? 'none' : 'glasses'; // Simple mapping
    }
    if (filteredStep.key === 'outfit' && value === 'graphicShirt') {
      // When selecting graphic outfit, ensure we have a visible graphic
      if (!character.outfitGraphic || character.outfitGraphic === 'none') {
        updatedCharacter.outfitGraphic = 'bear'; // Default to bear design
      }
    }
    
    // 🎯 RESET CONDITIONAL VALUES when prerequisites change
    if (filteredStep.key === 'outfit' && value !== 'graphicShirt') {
      // If not graphic shirt, reset graphic to none
      updatedCharacter.outfitGraphic = 'none';
    }
    if (filteredStep.key === 'accessories' && value === 'none') {
      // If no accessories, reset accessory color to default
      updatedCharacter.accessoryColor = '#262e33';
    }
    
    console.log('🎯 After update - hairColor:', updatedCharacter.hairColor, 'accessoryColor:', updatedCharacter.accessoryColor);
    
    setCharacter(updatedCharacter);
    // Auto-save every change
    await saveCharacterToStorage(updatedCharacter);
  };

  const handlePremiumClick = (option: PremiumOption) => {
    // Check if already purchased
    if (isPremiumItemPurchased(filteredStep.key, option.value)) {
      // Apply directly if already owned
      handleOptionClick(option.value);
    } else {
      // Show preview modal
      setPreviewItem({option, stepKey: filteredStep.key});
    }
  };

  const handlePurchase = async () => {
    if (!previewItem) return;
    
    setPurchasing(true);
    
    // Simulate purchase delay
    setTimeout(async () => {
      const success = purchasePremiumItem(previewItem.stepKey, previewItem.option.value, previewItem.option.cost, character);
      
      if (success) {
        // Apply the item and update character
        const updatedCharacter = {
          ...character,
          [previewItem.stepKey]: previewItem.option.value,
          endolots: (character.endolots || 0) - previewItem.option.cost
        };
        setCharacter(updatedCharacter);
        await saveCharacterToStorage(updatedCharacter);
      }
      
      setPurchasing(false);
      setPreviewItem(null);
    }, 800);
  };

  const closePreview = () => {
    setPreviewItem(null);
  };

  const handleFinish = async () => {
    setSaving(true);
    
    try {
      // Final save to storage
      const success = await saveCharacterToStorage(character);
      
      if (success) {
        // Small delay for UX
        setTimeout(() => {
          setSaving(false);
          // Navigate back to home screen where the saved character will be loaded
          navigation.goBack();
        }, 1000);
      } else {
        setSaving(false);
        console.error('Failed to save character');
      }
    } catch (error) {
      setSaving(false);
      console.error('Error saving character:', error);
    }
  };

  // Create preview character
  const previewCharacter = previewItem ? {
    ...character,
    [previewItem.stepKey]: previewItem.option.value
  } : character;

  return (
    <SafeAreaView style={characterStyles.container}>
      {/* Preview Modal */}
      <Modal
        visible={!!previewItem}
        animationType="slide"
        transparent={true}
        onRequestClose={closePreview}
      >
        <View style={characterStyles.modalOverlay}>
          <View style={characterStyles.modalContent}>
            <View style={characterStyles.modalHeader}>
              <Text style={characterStyles.modalTitle}>Preview Item</Text>
              <TouchableOpacity onPress={closePreview}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Preview Character */}
            <View style={characterStyles.modalPreview}>
              <DetailedCharacter character={previewCharacter} size={120} />
              <Text style={characterStyles.modalItemName}>{previewItem?.option.label}</Text>
              <View style={[
                characterStyles.modalRarityBadge,
                previewItem?.option.rarity === 'rare' ? characterStyles.modalRarityBadgeRare :
                previewItem?.option.rarity === 'epic' ? characterStyles.modalRarityBadgeEpic :
                characterStyles.modalRarityBadgeCommon
              ]}>
                <Text style={[
                  characterStyles.modalRarityText,
                  previewItem?.option.rarity === 'rare' ? characterStyles.modalRarityTextRare :
                  previewItem?.option.rarity === 'epic' ? characterStyles.modalRarityTextEpic :
                  characterStyles.modalRarityTextCommon
                ]}>
                  {previewItem?.option.rarity.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Price and Purchase */}
            <View style={characterStyles.priceSection}>
              <View style={characterStyles.priceRow}>
                <Text style={characterStyles.priceLabel}>Price:</Text>
                <View style={characterStyles.priceValue}>
                  <Ionicons name="diamond" size={16} color="#d97706" />
                  <Text style={characterStyles.priceAmount}>{previewItem?.option.cost}</Text>
                  <Text style={characterStyles.priceCurrency}>Endolots</Text>
                </View>
              </View>
              
              <View style={characterStyles.priceRow}>
                <Text style={characterStyles.priceLabel}>Your Balance:</Text>
                <View style={characterStyles.priceValue}>
                  <Ionicons name="diamond" size={16} color="#d97706" />
                  <Text style={characterStyles.priceAmount}>{currentEndolots}</Text>
                  <Text style={characterStyles.priceCurrency}>Endolots</Text>
                </View>
              </View>

              {currentEndolots >= (previewItem?.option.cost || 0) ? (
                <View style={characterStyles.actionButtonsRow}>
                  <TouchableOpacity
                    onPress={closePreview}
                    style={[characterStyles.actionButton, characterStyles.actionButtonSecondary]}
                  >
                    <Text style={[characterStyles.actionButtonText, characterStyles.actionButtonTextSecondary]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={purchasing}
                    style={[characterStyles.actionButton, characterStyles.actionButtonPrimary]}
                  >
                    {purchasing ? (
                      <View style={characterStyles.actionButtonLoading}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={[characterStyles.actionButtonText, characterStyles.actionButtonTextPrimary]}>Purchasing...</Text>
                      </View>
                    ) : (
                      <View style={characterStyles.actionButtonLoading}>
                        <Ionicons name="bag" size={16} color="white" />
                        <Text style={[characterStyles.actionButtonText, characterStyles.actionButtonTextPrimary]}>Purchase</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={characterStyles.insufficientFunds}>
                    <Text style={characterStyles.insufficientFundsText}>Not enough Endolots!</Text>
                  </View>
                  <TouchableOpacity
                    onPress={closePreview}
                    style={characterStyles.singleActionButton}
                  >
                    <Text style={characterStyles.singleActionButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={characterStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={characterStyles.padding}>
          <View style={characterStyles.mainCard}>
            <View style={characterStyles.header}>
              <Text style={characterStyles.headerTitle}>Customize Your Lotus</Text>
              <View style={characterStyles.headerInfo}>
                <View style={characterStyles.endolotsContainer}>
                  <Ionicons name="diamond" size={16} color="#d97706" />
                  <Text style={characterStyles.endolotsText}>{currentEndolots} Endolots</Text>
                </View>
                <Text style={characterStyles.stepText}>
                  Step {currentStep + 1} of {filteredSteps.length}
                </Text>
                {filteredSteps.length < customizationSteps.length && (
                  <Text style={characterStyles.skippedText}>
                    ({customizationSteps.length - filteredSteps.length} skipped)
                  </Text>
                )}
              </View>
            </View>
            
            {/* Progress bar */}
            <View style={characterStyles.progressBarContainer}>
              <View 
                style={[
                  characterStyles.progressBar,
                  {width: `${((currentStep + 1) / filteredSteps.length) * 100}%`}
                ]}
              />
            </View>

            {/* Character Preview - Clean lotus only */}
            <View style={characterStyles.previewSection}>
              <Text style={characterStyles.previewTitle}>Preview</Text>
              <DetailedCharacter character={character} size={isSmallScreen ? 180 : 220} />
            </View>

            {/* Step content */}
            <View style={characterStyles.stepContent}>
              <View style={characterStyles.stepHeader}>
                <Text style={characterStyles.stepTitle}>{filteredStep.title}</Text>
                <Text style={characterStyles.stepSubtitle}>Choose your preferred {filteredStep.title.toLowerCase()}</Text>
                {/* Conditional requirement note */}
                {filteredStep.key === 'outfitGraphic' && (
                  <Text style={characterStyles.warningText}>
                    ⚠️ Only available with Graphic T-shirt
                  </Text>
                )}
                {filteredStep.key === 'accessoryColor' && (
                  <Text style={characterStyles.warningText}>
                    👓 Only available with accessories
                  </Text>
                )}
              </View>
              
              {/* Free Options */}
              <View style={characterStyles.optionsSection}>
                <Text style={characterStyles.optionsSectionTitle}>Free Options</Text>
                <View style={characterStyles.optionsContainer}>
                                      {filteredStep.options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => handleOptionClick(option)}
                        style={[
                          characterStyles.optionButton,
                          (character as any)[filteredStep.key] === option
                            ? characterStyles.optionButtonSelected
                            : characterStyles.optionButtonDefault,
                          filteredStep.type === 'color' 
                            ? { backgroundColor: option, borderColor: (character as any)[filteredStep.key] === option ? '#ec4899' : '#e5e7eb' }
                            : undefined
                        ]}
                      >
                        {filteredStep.type === 'color' ? (
                          // No inner view for colors, the whole button is the color
                          null
                        ) : (
                          <Text style={[
                            characterStyles.optionText,
                            characterStyles.optionTextDefault // Always use default text style
                          ]}>
                            {option}
                          </Text>
                        )}
                        
                        {/* Selected indicator */}
                        {(character as any)[filteredStep.key] === option && (
                          <View style={characterStyles.selectedIndicator}>
                            <Text style={characterStyles.selectedIndicatorText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
              
              {/* Premium Options */}
              {currentPremiumOptions.length > 0 && (
                <View style={characterStyles.optionsSection}>
                  <View style={characterStyles.premiumSectionHeader}>
                    <Ionicons name="diamond" size={16} color="#d97706" />
                    <Text style={characterStyles.optionsSectionTitle}>Premium Options</Text>
                  </View>
                  <View style={characterStyles.optionsContainer}>
                    {currentPremiumOptions.map((option) => {
                      const isSelected = (character as any)[filteredStep.key] === option.value;
                      const isPurchased = isPremiumItemPurchased(filteredStep.key, option.value);
                      const canAfford = currentEndolots >= option.cost;
                      
                      return (
                        <View key={option.value} style={characterStyles.premiumOptionContainer}>
                          <TouchableOpacity
                            onPress={() => handlePremiumClick(option)} // Preview with popup
                            style={[
                              characterStyles.optionButton,
                              isSelected
                                ? characterStyles.optionButtonSelected
                                : characterStyles.optionButtonDefault,
                              filteredStep.type === 'color' 
                                ? { backgroundColor: option.value } 
                                : undefined
                            ]}
                          >
                            {filteredStep.type === 'color' ? (
                              <View style={characterStyles.colorOption} />
                            ) : (
                              <Text style={[
                                characterStyles.optionText,
                                isSelected ? characterStyles.optionTextSelected : characterStyles.optionTextDefault
                              ]}>
                                {option.label}
                              </Text>
                            )}
                          </TouchableOpacity>
                          
                          {/* Diamond badge */}
                          <View style={characterStyles.diamondBadge}>
                            <Ionicons 
                              name="diamond" 
                              size={16} 
                              color={canAfford ? "#d97706" : "#9ca3af"} 
                            />
                          </View>
                          
                          {/* Price label */}
                          <View style={characterStyles.priceLabel}>
                            <Text style={[
                              characterStyles.priceLabelText,
                              canAfford ? characterStyles.priceLabelAffordable : characterStyles.priceLabelUnaffordable
                            ]}>
                              {option.cost} E
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Navigation buttons */}
              <View style={characterStyles.navigationContainer}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      // Navigate to previous available step
                      let prevStep = currentStep - 1;
                      setCurrentStep(prevStep);
                    }}
                    style={[characterStyles.navButton, characterStyles.navButtonSecondary]}
                  >
                    <Text style={[characterStyles.navButtonText, characterStyles.navButtonTextSecondary]}>Previous</Text>
                  </TouchableOpacity>
                )}
                {isLastFilteredStep ? (
                  <TouchableOpacity
                    onPress={handleFinish}
                    disabled={saving}
                    style={[characterStyles.navButton, characterStyles.navButtonSuccess]}
                  >
                    {saving ? (
                      <View style={characterStyles.navButtonLoading}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={[characterStyles.navButtonText, characterStyles.navButtonTextPrimary]}>Saving...</Text>
                      </View>
                    ) : (
                      <Text style={[characterStyles.navButtonText, characterStyles.navButtonTextPrimary]}>✅ Save & Finish</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      // Navigate to next available step
                      let nextStep = currentStep + 1;
                      // Make sure we don't go beyond available filtered steps
                      if (nextStep >= filteredSteps.length) {
                        nextStep = filteredSteps.length - 1;
                      }
                      setCurrentStep(nextStep);
                    }}
                    style={[characterStyles.navButton, characterStyles.navButtonPrimary]}
                  >
                    <Text style={[characterStyles.navButtonText, characterStyles.navButtonTextPrimary]}>Next</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 