import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export interface ImageCaptureProps {
  onImageCaptured: (uri: string) => void;
  type: 'symptoms' | 'activity' | 'meal';
}

export function ImageCapture({ onImageCaptured, type }: ImageCaptureProps) {
  const [image, setImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      alert('Sorry, we need camera and library permissions to make this work!');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!await requestPermissions()) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        onImageCaptured(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo');
    }
  };

  const pickImage = async () => {
    if (!await requestPermissions()) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        onImageCaptured(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  return (
    <View className="space-y-4">
      {image ? (
        <View className="relative">
          <Image
            source={{ uri: image }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => {
              setImage(null);
              onImageCaptured('');
            }}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
          >
            <Text className="text-white">✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={takePhoto}
            className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
          >
            <Text className="text-gray-700">Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickImage}
            className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
          >
            <Text className="text-gray-700">Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 