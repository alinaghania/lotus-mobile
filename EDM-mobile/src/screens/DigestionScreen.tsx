import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { imageService } from '../services/imageService';
import ImageCapture from '../components/ImageCapture';

export default function DigestionScreen() {
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const handleImageCapture = (imageUri: string) => {
    setSelectedImages(prev => [...prev, imageUri]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const date = new Date().toISOString().split('T')[0];
      
      // Save all images
      for (const imageUri of selectedImages) {
        await imageService.uploadImage(user.id, date, imageUri, 'body_photo');
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setSelectedImages([]);
    } catch (error) {
      console.error('Error saving images:', error);
      Alert.alert('Error', 'Failed to save images');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {saved && (
        <View className="absolute top-4 right-4 bg-green-500 px-4 py-2 rounded shadow-lg z-50">
          <Text className="text-white">Images saved successfully!</Text>
        </View>
      )}
      
      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <Text className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Body Photos</Text>
          <Text className="text-gray-600 mb-6">Track your physical progress with photos</Text>
          
          {/* Instructions */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <Text className="text-blue-700 font-medium mb-2">📸 Photo Guidelines</Text>
            <Text className="text-blue-600 text-sm mb-1">• Take photos in good lighting</Text>
            <Text className="text-blue-600 text-sm mb-1">• Use consistent angles for comparison</Text>
            <Text className="text-blue-600 text-sm mb-1">• Photos are stored locally on your device</Text>
            <Text className="text-blue-600 text-sm">• Consider taking front, side, and back views</Text>
          </View>

          {/* Image Capture */}
          <View className="mb-6">
            <Text className="text-lg font-medium text-gray-900 mb-4">Add Photos</Text>
            <ImageCapture onImageCapture={handleImageCapture} />
          </View>

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-medium text-gray-900 mb-4">
                Today's Photos ({selectedImages.length})
              </Text>
              <View className="flex-row flex-wrap gap-4">
                {selectedImages.map((imageUri, index) => (
                  <View key={index} className="relative">
                    <View className="w-24 h-24 bg-gray-200 rounded-xl border border-gray-300 flex items-center justify-center">
                      <Text className="text-gray-500 text-xs">Photo {index + 1}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      <Text className="text-white text-xs">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Photo Categories */}
          <View className="mb-6">
            <Text className="text-lg font-medium text-gray-900 mb-4">Suggested Views</Text>
            <View className="space-y-3">
              {[
                { title: 'Front View', description: 'Face forward, arms at sides' },
                { title: 'Side Profile', description: 'Turn to the side' },
                { title: 'Back View', description: 'Turn around completely' },
                { title: 'Detail Shots', description: 'Focus on specific areas' }
              ].map((category, index) => (
                <View key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <View className="flex-row items-center gap-3">
                    <View className="w-6 h-6 bg-gray-400 rounded-full" />
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">{category.title}</Text>
                      <Text className="text-sm text-gray-600">{category.description}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={selectedImages.length === 0}
            className={`w-full py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-lg ${
              selectedImages.length === 0 ? 'opacity-50' : ''
            }`}
            style={{ backgroundColor: '#f97316' }}
          >
            <Text className="text-white text-lg">✓</Text>
            <Text className="text-white font-bold text-lg">
              Save {selectedImages.length} Photo{selectedImages.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 