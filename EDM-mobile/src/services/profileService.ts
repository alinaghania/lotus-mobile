import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/profile';

const keyFor = (userId: string) => `profile_${userId}`;

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : null;
  },

  async upsertProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    const now = new Date().toISOString();
    const base: UserProfile = raw ? JSON.parse(raw) : { userId, createdAt: now, updatedAt: now } as UserProfile;
    const merged: UserProfile = { ...base, ...updates, userId, updatedAt: now } as UserProfile;
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(merged));
    return merged;
  },
}; 