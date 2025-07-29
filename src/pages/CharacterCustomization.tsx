import React, { useState } from 'react';
import DetailedCharacter from '../components/DetailedCharacter';
import { Star, Coins, X, ShoppingCart } from 'lucide-react';
import { Character } from '../types/character';
import { 
  customizationSteps, 
  customizationOptions, 
  premiumOptions,
  PremiumOption
} from '../constants/customizationOptions';
import { saveCharacter, purchasePremiumItem, isPremiumItemPurchased } from '../utils/storage';

interface CharacterCustomizationProps {
  character: Character;
  setCharacter: (character: Character) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setCurrentPage?: (page: string) => void;
}

const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  character,
  setCharacter,
  currentStep,
  setCurrentStep,
  setCurrentPage,
}) => {
  const [previewItem, setPreviewItem] = useState<{option: PremiumOption, stepKey: string} | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const step = customizationSteps[currentStep];
  const isLastStep = currentStep === customizationSteps.length - 1;
  const currentEndolots = character.endolots || 0;

  // Get premium options for current step
  const currentPremiumOptions = premiumOptions[step.key as keyof typeof premiumOptions] || [];

  const handleOptionClick = (value: string) => {
    const updatedCharacter = {
      ...character,
      [step.key]: value,
    };
    setCharacter(updatedCharacter);
    // Auto-save every change
    saveCharacter(updatedCharacter);
  };

  const handlePremiumClick = (option: PremiumOption) => {
    // Check if already purchased
    if (isPremiumItemPurchased(step.key, option.value)) {
      // Apply directly if already owned
      handleOptionClick(option.value);
    } else {
      // Show preview modal
      setPreviewItem({option, stepKey: step.key});
    }
  };

  const handlePurchase = async () => {
    if (!previewItem) return;
    
    setPurchasing(true);
    
    // Simulate purchase delay
    setTimeout(() => {
      const success = purchasePremiumItem(previewItem.stepKey, previewItem.option.value, previewItem.option.cost, character);
      
      if (success) {
        // Apply the item and update character
        const updatedCharacter = {
          ...character,
          [previewItem.stepKey]: previewItem.option.value,
          endolots: character.endolots - previewItem.option.cost
        };
        setCharacter(updatedCharacter);
        saveCharacter(updatedCharacter);
      }
      
      setPurchasing(false);
      setPreviewItem(null);
    }, 800);
  };

  const closePreview = () => {
    setPreviewItem(null);
  };

  const handleFinish = () => {
    // Final save and redirect to home
    saveCharacter(character);
    setCurrentPage && setCurrentPage('home');
  };

  // Create preview character
  const previewCharacter = previewItem ? {
    ...character,
    [previewItem.stepKey]: previewItem.option.value
  } : character;

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Preview Item</h3>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Preview Character */}
            <div className="text-center mb-4">
              <DetailedCharacter character={previewCharacter} size={150} />
              <h4 className="font-bold text-lg mt-2">{previewItem.option.label}</h4>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                previewItem.option.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                previewItem.option.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {previewItem.option.rarity.toUpperCase()}
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-xl text-yellow-700">{previewItem.option.cost}</span>
                  <span className="text-yellow-600">Endolots</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Balance:</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-xl text-yellow-700">{currentEndolots}</span>
                  <span className="text-yellow-600">Endolots</span>
                </div>
              </div>

              {currentEndolots >= previewItem.option.cost ? (
                <div className="flex gap-3">
                  <button
                    onClick={closePreview}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {purchasing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Purchasing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Purchase
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-red-600 font-semibold mb-3">Not enough Endolots!</p>
                  <button
                    onClick={closePreview}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Customize Your Lotus
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="font-bold text-yellow-700">{currentEndolots} Endolots</span>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {customizationSteps.length}
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-gray-900 h-2 rounded-full transition-all duration-300" 
            style={{width: `${((currentStep + 1) / customizationSteps.length) * 100}%`}}
          ></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-center mb-4">Preview</h3>
            <DetailedCharacter character={character} size={200} />
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Star className="text-yellow-500" size={16} />
                <span className="font-bold">Level {character.level}</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">Choose your preferred {step.title.toLowerCase()}</p>
            </div>
            
            {/* Free Options */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Free Options</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {step.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      (character as any)[step.key] === option
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={step.type === 'color' ? { backgroundColor: option } : undefined}
                  >
                    {step.type === 'color' ? (
                      <div className="w-8 h-8 rounded mx-auto" />
                    ) : (
                      <span className="text-sm font-medium capitalize">{option}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Premium Options - PREVIEW SYSTEM */}
            {currentPremiumOptions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  Premium Options
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {currentPremiumOptions.map((option) => {
                    const isSelected = (character as any)[step.key] === option.value;
                    const isPurchased = isPremiumItemPurchased(step.key, option.value);
                    const canAfford = currentEndolots >= option.cost;
                    
                    return (
                      <div key={option.value} className="relative">
                        <button
                          onClick={() => handlePremiumClick(option)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 w-full ${
                            isSelected
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : isPurchased
                              ? 'border-green-500 hover:border-green-600'
                              : canAfford
                              ? 'border-yellow-400 hover:border-yellow-500'
                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                          style={step.type === 'color' ? { 
                            backgroundColor: option.value
                          } : undefined}
                          disabled={!canAfford && !isPurchased}
                        >
                          {step.type === 'color' ? (
                            <div className="w-8 h-8 rounded mx-auto" />
                          ) : (
                            <span className="text-sm font-medium capitalize">{option.label}</span>
                          )}
                        </button>
                        
                        {/* Status badge */}
                        <div className={`absolute -top-1 -right-1 text-xs px-2 py-0.5 rounded text-white font-bold ${
                          isPurchased ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                          {isPurchased ? '✓' : 'PREM'}
                        </div>
                        
                        {/* Price label */}
                        {!isPurchased && (
                          <div className="text-center mt-1">
                            <span className="text-xs font-bold text-yellow-600">{option.cost} E</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>
              )}
              {isLastStep ? (
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg"
                >
                  ✅ Save & Finish
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCustomization; 