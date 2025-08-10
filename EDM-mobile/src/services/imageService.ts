import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class ImageService {
  private async getImageKey(userId: string, date: string, type: string): Promise<string> {
    return `image_${userId}_${date}_${type}`;
  }

  private async getImagePath(userId: string, date: string, type: string, ext = 'jpg') {
    const dir = `${FileSystem.documentDirectory}images/${userId}/${date}/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    return `${dir}${type}.${ext}`;
  }

  // Store file locally and persist only the file URI reference
  async uploadImage(userId: string, date: string, type: string, uri: string): Promise<string> {
    try {
      const ext = uri.split('.').pop() || 'jpg';
      const dest = await this.getImagePath(userId, date, type, ext);

      // Copy file into app sandbox directory
      await FileSystem.copyAsync({ from: uri, to: dest });

      const key = await this.getImageKey(userId, date, type);
      await AsyncStorage.setItem(key, dest);
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
        const path = await AsyncStorage.getItem(key);
        if (path) {
          const parts = key.split('_');
          const type = parts[3];
          images[type] = path;
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
        const parts = key.split('_');
        const date = parts[2];
        const type = parts[3];
        if (date >= startDate && date <= endDate) {
          const path = await AsyncStorage.getItem(key);
          if (path) {
            if (!images[date]) images[date] = {};
            images[date][type] = path;
          }
        }
      })
    );

    return images;
  }

  async deleteImage(userId: string, date: string, type: string): Promise<void> {
    const key = await this.getImageKey(userId, date, type);
    const path = await AsyncStorage.getItem(key);
    if (path) {
      await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
    }
    await AsyncStorage.removeItem(key);
  }

  async deleteUserImages(userId: string): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith(`image_${userId}_`));
    await Promise.all(
      imageKeys.map(async key => {
        const path = await AsyncStorage.getItem(key);
        if (path) {
          await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
        }
        await AsyncStorage.removeItem(key);
      })
    );
  }
}

export const imageService = new ImageService(); 