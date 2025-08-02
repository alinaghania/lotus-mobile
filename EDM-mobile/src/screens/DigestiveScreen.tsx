import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface DigestivePhoto {
  id: string;
  uri: string;
  time: 'morning' | 'evening';
  timestamp: Date;
  notes?: string;
}

const digestiveStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  

  // Grid view controls
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  viewButtonActive: {
    backgroundColor: '#111827',
  },
  viewButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewButtonTextActive: {
    color: 'white',
  },
  viewButtonTextInactive: {
    color: '#6b7280',
  },

  // Grid view
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  gridTimeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridTimeBadgeMorning: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
  },
  gridTimeBadgeEvening: {
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
  },
  gridTimeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    padding: 2,
  },

  // Feed view (single posts)
  feedContainer: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postMeta: {
    flex: 1,
  },
  username: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeStamp: {
    color: '#6b7280',
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
  },
  
  // Photo section
  photoContainer: {
    width: '100%',
    height: width,
    backgroundColor: '#111',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  timeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Actions section
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    marginRight: 16,
  },
  
  // Caption section
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  captionText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Add photo button
  addPhotoCard: {
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  addPhotoText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Time selector
  timeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 4,
  },
  timeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeOptionActive: {
    backgroundColor: '#007AFF',
  },
  timeOptionText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: 'white',
  },
});

export default function DigestiveScreen() {
  const [photos, setPhotos] = useState<DigestivePhoto[]>([]);
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: DigestivePhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        time: selectedTime,
        timestamp: new Date(),
        notes: `${selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)} belly check`
      };
      setPhotos(prev => [newPhoto, ...prev]);
    }
  };

  const selectFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Photo library permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: DigestivePhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        time: selectedTime,
        timestamp: new Date(),
        notes: `${selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)} belly check`
      };
      setPhotos(prev => [newPhoto, ...prev]);
    }
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={digestiveStyles.container}>
      {/* Header */}
      <View style={digestiveStyles.header}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
        <Text style={digestiveStyles.headerTitle}>Digestive Tracker</Text>
        <TouchableOpacity style={digestiveStyles.headerButton}>
          <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={digestiveStyles.scrollContainer}>
                {/* Time Selector */}
        <View style={digestiveStyles.timeSelector}>
          {(['morning', 'evening'] as const).map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                digestiveStyles.timeOption,
                selectedTime === time && digestiveStyles.timeOptionActive
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                digestiveStyles.timeOptionText,
                selectedTime === time && digestiveStyles.timeOptionTextActive
              ]}>
                {time === 'morning' ? 'Morning' : 'Evening'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* View Toggle */}
        <View style={digestiveStyles.viewToggle}>
          <TouchableOpacity
            style={[
              digestiveStyles.viewButton,
              viewMode === 'grid' ? digestiveStyles.viewButtonActive : digestiveStyles.viewButtonInactive
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={[
              digestiveStyles.viewButtonText,
              viewMode === 'grid' ? digestiveStyles.viewButtonTextActive : digestiveStyles.viewButtonTextInactive
            ]}>
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              digestiveStyles.viewButton,
              viewMode === 'feed' ? digestiveStyles.viewButtonActive : digestiveStyles.viewButtonInactive
            ]}
            onPress={() => setViewMode('feed')}
          >
            <Text style={[
              digestiveStyles.viewButtonText,
              viewMode === 'feed' ? digestiveStyles.viewButtonTextActive : digestiveStyles.viewButtonTextInactive
            ]}>
              Feed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Photo Card */}
        <View style={digestiveStyles.addPhotoCard}>
          <TouchableOpacity style={digestiveStyles.addPhotoButton} onPress={takePicture}>
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={digestiveStyles.addPhotoText}>
              Take {selectedTime} belly photo{'\n'}for digestive tracking
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={digestiveStyles.addPhotoButton} onPress={selectFromLibrary}>
            <Ionicons name="images" size={24} color="#666" />
            <Text style={[digestiveStyles.addPhotoText, { fontSize: 14, marginTop: 4 }]}>
              or choose from library
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content View */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <View style={digestiveStyles.gridContainer}>
            {photos.map((photo) => (
              <TouchableOpacity key={photo.id} style={digestiveStyles.gridItem}>
                <Image source={{ uri: photo.uri }} style={digestiveStyles.gridPhoto} />
                <View style={[
                  digestiveStyles.gridTimeBadge,
                  photo.time === 'morning' ? digestiveStyles.gridTimeBadgeMorning : digestiveStyles.gridTimeBadgeEvening
                ]}>
                  <Text style={digestiveStyles.gridTimeBadgeText}>
                    {photo.time === 'morning' ? 'AM' : 'PM'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={digestiveStyles.deleteButton}
                  onPress={() => deletePhoto(photo.id)}
                >
                  <Ionicons name="close-circle" size={20} color="rgba(239, 68, 68, 0.8)" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {photos.length === 0 && (
              <View style={digestiveStyles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#6b7280" />
                <Text style={digestiveStyles.placeholderText}>
                  No photos yet{'\n'}Start tracking your digestive health!
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Feed View */
          <View style={digestiveStyles.feedContainer}>
            {photos.map((photo) => (
              <View key={photo.id} style={digestiveStyles.postCard}>
                {/* Post Header */}
                <View style={digestiveStyles.postHeader}>
                  <View style={digestiveStyles.profilePic}>
                    <Ionicons name="person" size={16} color="#6b7280" />
                  </View>
                  <View style={digestiveStyles.postMeta}>
                    <Text style={digestiveStyles.username}>Your Digestive Journey</Text>
                    <Text style={digestiveStyles.timeStamp}>
                      {formatDate(photo.timestamp)} • {formatTime(photo.timestamp)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={digestiveStyles.moreButton}
                    onPress={() => deletePhoto(photo.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Photo */}
                <View style={digestiveStyles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={digestiveStyles.photo} />
                  <View style={[
                    digestiveStyles.timeBadge,
                    { backgroundColor: photo.time === 'morning' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(139, 69, 19, 0.8)' }
                  ]}>
                    <Text style={digestiveStyles.timeBadgeText}>
                      {photo.time === 'morning' ? 'Morning' : 'Evening'}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={digestiveStyles.actionsContainer}>
                  <TouchableOpacity style={digestiveStyles.actionButton}>
                    <Ionicons name="heart-outline" size={24} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={digestiveStyles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={24} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={digestiveStyles.actionButton}>
                    <Ionicons name="share-outline" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Caption */}
                <View style={digestiveStyles.captionContainer}>
                  <Text style={digestiveStyles.captionText}>
                    <Text style={{ fontWeight: '600' }}>You </Text>
                    {photo.notes}
                  </Text>
                </View>
              </View>
            ))}

            {photos.length === 0 && (
              <View style={digestiveStyles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#6b7280" />
                <Text style={digestiveStyles.placeholderText}>
                  No photos yet{'\n'}Start tracking your digestive health!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 