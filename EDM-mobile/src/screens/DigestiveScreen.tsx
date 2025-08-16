import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseService from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface DigestivePhoto {
  id: string;
  uri: string;
  time: 'morning' | 'evening';
  timestamp: Date;
  notes?: string;
  likes: number;
  isLiked: boolean;
  comments: string[];
  bloated?: boolean;
}

const digestiveStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    backgroundColor: '#111827', // Black
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

  // Grid view - Instagram style
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  gridPhotoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(124, 58, 237, 0.8)', // Morning purple
  },
  gridTimeBadgeEvening: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)', // Evening lighter purple
  },
  gridTimeBadgeBloated: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)', // Black for bloated
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
  
  // Photo info
  photoInfo: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  photoDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  photoTime: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
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
    backgroundColor: '#e5e7eb',
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
    backgroundColor: '#ffffff',
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
  
  // Upload section like Instagram
  uploadSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  cameraButton: {
    backgroundColor: '#7c3aed',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  galleryButton: {
    backgroundColor: '#059669',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Time selector
  timeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  timeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  timeOptionActive: {
    backgroundColor: '#111827',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  timeOptionText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  timeOptionTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  
  // Comments and Likes
  interactionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  interactionButtonActive: {
    backgroundColor: '#111827',
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  interactionTextActive: {
    color: 'white',
  },
  
  // Save button improvements
  saveButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Comment Modal styles
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  commentModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  commentCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  commentCancelText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
  commentPostButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  commentPostText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bloatedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  bloatedOptionActive: {
    backgroundColor: '#f3f4f6',
  },
  bloatedOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  bloatedOptionTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  commentsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentItem: {
    marginBottom: 4,
  },
  commentText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 18,
  },
  gridDateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  gridDateText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '90%',
    height: '80%',
  },
  zoomedImage: {
    width: '100%',
    height: '100%',
  },
});

const DIGESTIVE_PHOTOS_KEY = 'digestive_photos';

export default function DigestiveScreen() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<DigestivePhoto[]>([]);
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('');
  const [commentText, setCommentText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isBloated, setIsBloated] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string>('');
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);

  // Load photos on component mount
  useEffect(() => {
    loadPhotos();
  }, []);

  // Helper function to copy image to permanent location and convert to base64
  const saveImagePermanently = async (uri: string): Promise<{ permanentUri: string; base64Data: string }> => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `digestive_photo_${timestamp}.jpg`;
      
      // Get the document directory path
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Document directory not available');
      }
      
      // Create digestive photos directory if it doesn't exist
      const digestiveDir = `${documentDir}digestive_photos/`;
      const dirInfo = await FileSystem.getInfoAsync(digestiveDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(digestiveDir, { intermediates: true });
      }
      
      // Copy the image to the permanent location
      const permanentUri = `${digestiveDir}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: permanentUri
      });
      
      // Convert to base64 for MongoDB storage
      const base64Data = await FileSystem.readAsStringAsync(permanentUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return { permanentUri, base64Data };
    } catch (error) {
      console.error('Error saving image permanently:', error);
      throw error;
    }
  };

  const loadPhotos = async () => {
    if (!user) return;

    try {
      // Try to load from MongoDB first
      let loadedPhotos: DigestivePhoto[] = [];
      
      try {
        const firebasePhotos = await firebaseService.getUserPhotos(user.id);
        loadedPhotos = firebasePhotos.map(firebasePhoto => ({
          id: firebasePhoto.photoId,
          uri: firebasePhoto.downloadURL,
          time: firebasePhoto.time,
          timestamp: new Date(firebasePhoto.timestamp),
          notes: firebasePhoto.notes,
          likes: firebasePhoto.likes,
          isLiked: firebasePhoto.isLiked,
          comments: firebasePhoto.comments,
          bloated: firebasePhoto.bloated
        }));
        console.log(`✅ Loaded ${loadedPhotos.length} photos from Firebase`);
      } catch (firebaseError) {
        console.error('❌ Error loading from Firebase, using local storage:', firebaseError);
        
        // Fallback to AsyncStorage
        const savedPhotos = await AsyncStorage.getItem(DIGESTIVE_PHOTOS_KEY);
        if (savedPhotos) {
          const parsedPhotos = JSON.parse(savedPhotos);
          const photosWithDates = [];
          
          for (const photo of parsedPhotos) {
            // Check if the image file still exists
            try {
              const fileInfo = await FileSystem.getInfoAsync(photo.uri);
              if (fileInfo.exists) {
                photosWithDates.push({
                  ...photo,
                  timestamp: new Date(photo.timestamp)
                });
              } else {
                console.warn(`Image file not found: ${photo.uri}`);
              }
            } catch (fileError) {
              console.warn(`Error checking file: ${photo.uri}`, fileError);
            }
          }
          
          loadedPhotos = photosWithDates;
          
          // If some photos were removed, update AsyncStorage
          if (photosWithDates.length !== parsedPhotos.length) {
            await AsyncStorage.setItem(DIGESTIVE_PHOTOS_KEY, JSON.stringify(photosWithDates));
          }
        }
      }
      
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const savePhotos = async () => {
    try {
      await AsyncStorage.setItem(DIGESTIVE_PHOTOS_KEY, JSON.stringify(photos));
      Alert.alert('Success', 'Photos saved successfully!');
    } catch (error) {
      console.error('Error saving photos:', error);
      Alert.alert('Error', 'Failed to save photos');
    }
  };

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
      // Store the photo URI and open note modal
      setPendingPhotoUri(result.assets[0].uri);
      setNoteText('');
      setIsBloated(false);
      setShowNoteModal(true);
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
      // Store the photo URI and open note modal
      setPendingPhotoUri(result.assets[0].uri);
      setNoteText('');
      setIsBloated(false);
      setShowNoteModal(true);
    }
  };

  const savePhotoWithNote = async () => {
    if (pendingPhotoUri && user) {
      try {
        // Save image permanently and get base64
        const { permanentUri, base64Data } = await saveImagePermanently(pendingPhotoUri);
        
        const photoId = Date.now().toString();
        const newPhoto: DigestivePhoto = {
          id: photoId,
          uri: permanentUri,
          time: selectedTime,
          timestamp: new Date(),
          notes: noteText || `${selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)} belly check`,
          likes: 0,
          isLiked: false,
          comments: [],
          bloated: isBloated
        };
        
        // Save to Firebase
        try {
          await firebaseService.savePhoto({
            userId: user.id,
            photoId,
            time: selectedTime,
            timestamp: new Date(),
            notes: noteText || `${selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)} belly check`,
            likes: 0,
            isLiked: false,
            comments: [],
            bloated: isBloated
          }, permanentUri);
          console.log('✅ Photo saved to Firebase successfully');
        } catch (firebaseError) {
          console.error('❌ Error saving photo to Firebase:', firebaseError);
        }
        
        setPhotos(prev => [newPhoto, ...prev]);
        
        // Auto-save photos to AsyncStorage as backup
        const updatedPhotos = [newPhoto, ...photos];
        await AsyncStorage.setItem(DIGESTIVE_PHOTOS_KEY, JSON.stringify(updatedPhotos));
        
        // Reset states
        setPendingPhotoUri('');
        setNoteText('');
        setIsBloated(false);
        setShowNoteModal(false);
      } catch (error) {
        console.error('Error saving photo:', error);
        Alert.alert('Error', 'Failed to save photo. Please try again.');
      }
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!user) return;

    try {
      // Find the photo to get its URI
      const photoToDelete = photos.find(photo => photo.id === photoId);
      if (photoToDelete) {
        // Delete from Firebase
        try {
          await firebaseService.deletePhoto(photoId, user.id);
          console.log('✅ Photo deleted from Firebase');
        } catch (firebaseError) {
          console.error('❌ Error deleting from Firebase:', firebaseError);
        }

        // Try to delete the physical file
        try {
          const fileInfo = await FileSystem.getInfoAsync(photoToDelete.uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(photoToDelete.uri);
          }
        } catch (fileError) {
          console.warn('Error deleting file:', fileError);
        }
      }
      
      // Remove photo from state
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      setPhotos(updatedPhotos);
      
      // Update AsyncStorage
      await AsyncStorage.setItem(DIGESTIVE_PHOTOS_KEY, JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const openImageModal = (imageUri: string) => {
    setSelectedImageUri(imageUri);
    setShowImageModal(true);
  };

  const toggleLike = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, isLiked: !photo.isLiked, likes: photo.isLiked ? photo.likes - 1 : photo.likes + 1 }
        : photo
    ));
  };

  const openCommentModal = (photoId: string) => {
    setSelectedPhotoId(photoId);
    setShowCommentModal(true);
  };

  const addComment = () => {
    if (commentText.trim() && selectedPhotoId) {
      setPhotos(prev => prev.map(photo => 
        photo.id === selectedPhotoId 
          ? { ...photo, comments: [...photo.comments, commentText.trim()] }
          : photo
      ));
      setCommentText('');
      setShowCommentModal(false);
      setSelectedPhotoId('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[digestiveStyles.container, { backgroundColor: '#fff' }]}>
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
              selectedTime === time ? digestiveStyles.timeOptionTextActive : null
            ]}>
              {time === 'morning' ? 'Morning' : 'Evening'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upload Section - Fixed position */}
      <View style={digestiveStyles.uploadSection}>
        <TouchableOpacity style={digestiveStyles.cameraButton} onPress={takePicture}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={digestiveStyles.galleryButton} onPress={selectFromLibrary}>
          <Ionicons name="image" size={24} color="white" />
        </TouchableOpacity>
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

      <ScrollView style={digestiveStyles.scrollContainer}>

        {/* Content View */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <View style={digestiveStyles.gridContainer}>
            {photos.filter(photo => photo.time === selectedTime).map((photo) => (
              <View key={photo.id} style={digestiveStyles.gridItem}>
                <TouchableOpacity 
                  style={digestiveStyles.gridPhotoContainer}
                  onPress={() => openImageModal(photo.uri)}
                >
                  <Image 
                    source={{ uri: photo.uri }} 
                    style={digestiveStyles.gridPhoto}
                    resizeMode="cover"
                  />
                  <View style={[
                    digestiveStyles.gridTimeBadge,
                    photo.bloated 
                      ? digestiveStyles.gridTimeBadgeBloated
                      : photo.time === 'morning' 
                        ? digestiveStyles.gridTimeBadgeMorning 
                        : digestiveStyles.gridTimeBadgeEvening
                  ]}>
                    <Text style={digestiveStyles.gridTimeBadgeText}>
                      {photo.time === 'morning' ? 'AM' : 'PM'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={digestiveStyles.deleteButton}
                    onPress={() => deletePhoto(photo.id)}
                  >
                    <Ionicons name="close-circle" size={16} color="rgba(239, 68, 68, 0.9)" />
                  </TouchableOpacity>
                  
                  {/* Date overlay at bottom */}
                  <View style={digestiveStyles.gridDateOverlay}>
                    <Text style={digestiveStyles.gridDateText}>
                      {formatDate(photo.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
            {photos.filter(photo => photo.time === selectedTime).length === 0 && (
              <View style={[digestiveStyles.photoPlaceholder, { width: '100%', height: 200 }]}>
                <Ionicons name="camera-outline" size={48} color="#6b7280" />
                <Text style={digestiveStyles.placeholderText}>
                  No {selectedTime} photos yet{'\n'}Start tracking your digestive health!
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Feed View */
          <View style={digestiveStyles.feedContainer}>
            {photos.filter(photo => photo.time === selectedTime).map((photo) => (
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
                  <TouchableOpacity onPress={() => openImageModal(photo.uri)}>
                    <Image source={{ uri: photo.uri }} style={digestiveStyles.photo} />
                  </TouchableOpacity>
                  <View style={[
                    digestiveStyles.timeBadge,
                    { backgroundColor: photo.bloated 
                        ? 'rgba(17, 24, 39, 0.8)' 
                        : photo.time === 'morning' 
                          ? 'rgba(59, 130, 246, 0.8)' 
                          : 'rgba(139, 69, 19, 0.8)' 
                    }
                  ]}>
                    <Text style={digestiveStyles.timeBadgeText}>
                      {photo.time === 'morning' ? 'Morning' : 'Evening'}
                    </Text>
                  </View>
                </View>

                {/* Interactions */}
                <View style={digestiveStyles.interactionBar}>
                  <TouchableOpacity 
                    style={[
                      digestiveStyles.interactionButton,
                      photo.isLiked && digestiveStyles.interactionButtonActive
                    ]}
                    onPress={() => toggleLike(photo.id)}
                  >
                    <Ionicons 
                      name={photo.isLiked ? "heart" : "heart-outline"} 
                      size={20} 
                      color={photo.isLiked ? "white" : "#374151"} 
                    />
                    <Text style={[
                      digestiveStyles.interactionText,
                      photo.isLiked && digestiveStyles.interactionTextActive
                    ]}>
                      {photo.likes} {photo.likes === 1 ? 'Like' : 'Likes'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={digestiveStyles.interactionButton}
                    onPress={() => openCommentModal(photo.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#374151" />
                    <Text style={digestiveStyles.interactionText}>
                      {photo.comments.length} {photo.comments.length === 1 ? 'Comment' : 'Comments'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Caption */}
                <View style={digestiveStyles.captionContainer}>
                  <Text style={digestiveStyles.captionText}>
                    <Text style={{ fontWeight: '600' }}>You </Text>
                    {photo.notes}
                  </Text>
                </View>

                {/* Comments */}
                {photo.comments.length > 0 && (
                  <View style={digestiveStyles.commentsContainer}>
                    {photo.comments.map((comment, index) => (
                      <View key={index} style={digestiveStyles.commentItem}>
                        <Text style={digestiveStyles.commentText}>
                          <Text style={{ fontWeight: '600' }}>You </Text>
                          {comment}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {photos.filter(photo => photo.time === selectedTime).length === 0 && (
              <View style={digestiveStyles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#6b7280" />
                <Text style={digestiveStyles.placeholderText}>
                  No {selectedTime} photos yet{'\n'}Start tracking your digestive health!
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Save Button */}
        {photos.length > 0 && (
          <TouchableOpacity style={digestiveStyles.saveButton} onPress={savePhotos}>
            <Text style={digestiveStyles.saveButtonText}>Save Photos</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={digestiveStyles.commentModalOverlay}>
            <View style={digestiveStyles.commentModalContent}>
            <View style={digestiveStyles.commentModalHeader}>
              <Text style={digestiveStyles.commentModalTitle}>Add Note</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                  setIsBloated(false);
                  setPendingPhotoUri('');
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={digestiveStyles.commentInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note about your digestive state..."
              multiline
              numberOfLines={3}
              autoFocus
            />
            
            {/* Bloated option */}
            <TouchableOpacity
              style={[
                digestiveStyles.bloatedOption,
                isBloated && digestiveStyles.bloatedOptionActive
              ]}
              onPress={() => setIsBloated(!isBloated)}
            >
              <Ionicons 
                name={isBloated ? "checkbox" : "square-outline"} 
                size={20} 
                color={isBloated ? "#111827" : "#6b7280"} 
              />
              <Text style={[
                digestiveStyles.bloatedOptionText,
                isBloated && digestiveStyles.bloatedOptionTextActive
              ]}>
                Feeling bloated
              </Text>
            </TouchableOpacity>
            
            <View style={digestiveStyles.commentModalActions}>
              <TouchableOpacity
                style={digestiveStyles.commentCancelButton}
                onPress={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                  setIsBloated(false);
                  setPendingPhotoUri('');
                }}
              >
                <Text style={digestiveStyles.commentCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={digestiveStyles.commentPostButton}
                onPress={savePhotoWithNote}
              >
                <Text style={digestiveStyles.commentPostText}>Save Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={digestiveStyles.commentModalOverlay}>
            <View style={digestiveStyles.commentModalContent}>
              <View style={digestiveStyles.commentModalHeader}>
              <Text style={digestiveStyles.commentModalTitle}>Add Comment</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentModal(false);
                  setCommentText('');
                  setSelectedPhotoId('');
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={digestiveStyles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write your comment..."
              multiline
              numberOfLines={4}
              autoFocus
            />
            
            <View style={digestiveStyles.commentModalActions}>
              <TouchableOpacity
                style={digestiveStyles.commentCancelButton}
                onPress={() => {
                  setShowCommentModal(false);
                  setCommentText('');
                  setSelectedPhotoId('');
                }}
              >
                <Text style={digestiveStyles.commentCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={digestiveStyles.commentPostButton}
                onPress={addComment}
                disabled={!commentText.trim()}
              >
                <Text style={digestiveStyles.commentPostText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={digestiveStyles.imageModalOverlay}>
          <TouchableOpacity 
            style={digestiveStyles.imageModalCloseArea}
            onPress={() => setShowImageModal(false)}
          >
            <View style={digestiveStyles.imageModalContent}>
              <Image 
                source={{ uri: selectedImageUri }} 
                style={digestiveStyles.zoomedImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 