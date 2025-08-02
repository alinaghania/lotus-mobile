import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DigestiveIssuesScreenProps {
  selectedDate?: Date;
}

// Helper to get consistent local date key YYYY-MM-DD
const getDateKey = (d: Date) => d.toLocaleDateString('sv-SE'); // sv-SE yields ISO-like 2023-09-23 in local tz

export default function DigestiveIssuesScreen({ selectedDate = new Date() }: DigestiveIssuesScreenProps) {
  const [photos, setPhotos] = useState<Record<string, { morning?: string; evening?: string }>>({});
  const [preview, setPreview] = useState<{ type: 'morning' | 'evening'; uri: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const today = new Date();
  const maxDate = new Date(today.toDateString());
  
  const clampDate = (d: Date) => {
    if (d > maxDate) return maxDate;
    return d;
  };

  // Load photos from async storage on component mount
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const storedPhotos = await AsyncStorage.getItem('digestivePhotos');
      if (storedPhotos) {
        setPhotos(JSON.parse(storedPhotos));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  // Save photos to async storage whenever they change
  useEffect(() => {
    savePhotos();
  }, [photos]);

  const savePhotos = async () => {
    try {
      await AsyncStorage.setItem('digestivePhotos', JSON.stringify(photos));
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to save photos.');
      return false;
    }
    return true;
  };

  const takePhoto = async (type: 'morning' | 'evening') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPreview({
          type,
          uri: result.assets[0].uri
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to access photos');
    }
  };

  const handleSave = () => {
    if (preview) {
      const key = getDateKey(currentDate);
      setPhotos(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [preview.type]: preview.uri
        }
      }));
      setPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const deletePhoto = (type: 'morning' | 'evening') => {
    const key = getDateKey(currentDate);
    setPhotos(prev => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key][type];
        if (!updated[key].morning && !updated[key].evening) {
          delete updated[key];
        }
      }
      return updated;
    });
  };

  const currentPhotos = photos[getDateKey(currentDate)] || {};

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {saved && (
        <View className="absolute top-16 right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg z-50">
          <Text className="text-white font-semibold">Saved!</Text>
        </View>
      )}
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Digestive Tracker</Text>
            <Text className="text-gray-600 mb-4">Take belly photos morning and evening to monitor bloating.</Text>
            
            {/* Date Navigation */}
            <View className="flex-row items-center justify-center gap-4 mb-6">
              <TouchableOpacity
                onPress={() => setCurrentDate(clampDate(new Date(currentDate.getTime() - 86400000)))}
                className="px-3 py-2 bg-gray-100 rounded-lg"
              >
                <Ionicons name="chevron-back" size={20} color="#666" />
              </TouchableOpacity>
              
              <View className="bg-white border border-gray-300 px-4 py-2 rounded-xl shadow-sm">
                <Text className="text-gray-900 font-semibold">
                  {currentDate.toLocaleDateString('en-US', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
              
              <TouchableOpacity
                disabled={currentDate >= maxDate}
                onPress={() => setCurrentDate(clampDate(new Date(currentDate.getTime() + 86400000)))}
                className={`px-3 py-2 rounded-lg ${
                  currentDate >= maxDate ? 'bg-gray-200' : 'bg-gray-100'
                }`}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={currentDate >= maxDate ? '#ccc' : '#666'} 
                />
              </TouchableOpacity>
            </View>

            {/* Photo Sections */}
            <View className="space-y-6">
              {/* Morning Photo */}
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <Ionicons name="sunny-outline" size={20} color="#f59e0b" />
                  <Text className="text-lg font-semibold text-gray-900">Morning Photo</Text>
                </View>
                
                {currentPhotos.morning && !preview ? (
                  <View className="items-center">
                    <Image 
                      source={{ uri: currentPhotos.morning }} 
                      className="w-full h-64 rounded-xl mb-3"
                      style={{ resizeMode: 'cover' }}
                    />
                    <TouchableOpacity
                      onPress={() => deletePhoto('morning')}
                      className="bg-red-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-semibold">Delete Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : preview && preview.type === 'morning' ? (
                  <View className="items-center">
                    <Image 
                      source={{ uri: preview.uri }} 
                      className="w-full h-64 rounded-xl mb-3"
                      style={{ resizeMode: 'cover' }}
                    />
                    <TouchableOpacity
                      onPress={handleSave}
                      className="bg-green-600 px-6 py-3 rounded-lg"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text className="text-white font-semibold">Save</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => takePhoto('morning')}
                    className="border-2 border-dashed border-gray-300 rounded-xl py-8 items-center"
                  >
                    <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                    <Text className="text-gray-500 mt-2">
                      {currentPhotos.morning ? 'Replace Photo' : 'Take Morning Photo'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Evening Photo */}
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <Ionicons name="moon-outline" size={20} color="#6366f1" />
                  <Text className="text-lg font-semibold text-gray-900">Evening Photo</Text>
                </View>
                
                {currentPhotos.evening && !preview ? (
                  <View className="items-center">
                    <Image 
                      source={{ uri: currentPhotos.evening }} 
                      className="w-full h-64 rounded-xl mb-3"
                      style={{ resizeMode: 'cover' }}
                    />
                    <TouchableOpacity
                      onPress={() => deletePhoto('evening')}
                      className="bg-red-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-semibold">Delete Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : preview && preview.type === 'evening' ? (
                  <View className="items-center">
                    <Image 
                      source={{ uri: preview.uri }} 
                      className="w-full h-64 rounded-xl mb-3"
                      style={{ resizeMode: 'cover' }}
                    />
                    <TouchableOpacity
                      onPress={handleSave}
                      className="bg-green-600 px-6 py-3 rounded-lg"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text className="text-white font-semibold">Save</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => takePhoto('evening')}
                    className="border-2 border-dashed border-gray-300 rounded-xl py-8 items-center"
                  >
                    <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                    <Text className="text-gray-500 mt-2">
                      {currentPhotos.evening ? 'Replace Photo' : 'Take Evening Photo'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Summary */}
            <View className="mt-6 bg-blue-50 rounded-xl p-4">
              <Text className="text-blue-900 font-semibold mb-2">Daily Progress</Text>
              <View className="flex-row gap-4">
                <View className="flex-1 flex-row items-center gap-2">
                  <Ionicons 
                    name={currentPhotos.morning ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={currentPhotos.morning ? "#10b981" : "#9ca3af"} 
                  />
                  <Text className={`text-sm ${currentPhotos.morning ? 'text-green-700' : 'text-gray-500'}`}>
                    Morning
                  </Text>
                </View>
                <View className="flex-1 flex-row items-center gap-2">
                  <Ionicons 
                    name={currentPhotos.evening ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={currentPhotos.evening ? "#10b981" : "#9ca3af"} 
                  />
                  <Text className={`text-sm ${currentPhotos.evening ? 'text-green-700' : 'text-gray-500'}`}>
                    Evening
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 