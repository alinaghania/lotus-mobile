import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class ImageService {
  private async getImageKey(userId: string, date: string, type: string): string {
    return `image_${userId}_${date}_${type}`;
  }

  async uploadImage(userId: string, date: string, type: string, uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const key = await this.getImageKey(userId, date, type);
      await AsyncStorage.setItem(key, base64);
      return key;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async getImagesByDate(userId: string, date: string): Promise<{ [key: string]: string }> {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith(`image_${userId}_${date}_`));
    
    const images: { [key: string]: string } = {};
    await Promise.all(
      imageKeys.map(async key => {
        const base64 = await AsyncStorage.getItem(key);
        if (base64) {
          const type = key.split('_')[3]; // Get the type from the key
          images[type] = base64;
        }
      })
    );
    
    return images;
  }

  async getImagesByDateRange(userId: string, startDate: string, endDate: string): Promise<{ [date: string]: { [type: string]: string } }> {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith(`image_${userId}_`));
    
    const images: { [date: string]: { [type: string]: string } } = {};
    await Promise.all(
      imageKeys.map(async key => {
        const [_, __, date, type] = key.split('_');
        if (date >= startDate && date <= endDate) {
          const base64 = await AsyncStorage.getItem(key);
          if (base64) {
            if (!images[date]) {
              images[date] = {};
            }
            images[date][type] = base64;
          }
        }
      })
    );
    
    return images;
  }

  async deleteImage(userId: string, date: string, type: string): Promise<void> {
    const key = await this.getImageKey(userId, date, type);
    await AsyncStorage.removeItem(key);
  }

  async deleteUserImages(userId: string): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith(`image_${userId}_`));
    await Promise.all(imageKeys.map(key => AsyncStorage.removeItem(key)));
  }
}

export const imageService = new ImageService(); 