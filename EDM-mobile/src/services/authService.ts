import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

class AuthService {
  private async hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = await Crypto.getRandomBytesAsync(16);
    // Convert salt to base64
    const saltBase64 = btoa(String.fromCharCode(...new Uint8Array(salt)));
    // Hash the password with the salt
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + saltBase64
    );
    return `${saltBase64}:${hash}`;
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [saltBase64, storedHash] = hashedPassword.split(':');
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + saltBase64
    );
    return hash === storedHash;
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Check if user already exists
      const users = await AsyncStorage.getAllKeys();
      const existingUser = await Promise.all(
        users
          .filter(key => key.startsWith('user_'))
          .map(async key => JSON.parse(await AsyncStorage.getItem(key) || '{}'))
      ).then(users => users.find(user => user.email === credentials.email));

      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await this.hashPassword(credentials.password);
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        hashedPassword
      };
      
      await AsyncStorage.setItem(`user_${user.id}`, JSON.stringify(user));
      await AsyncStorage.setItem('currentUser', user.id);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      const users = await AsyncStorage.getAllKeys();
      for (const key of users) {
        if (key.startsWith('user_')) {
          const user = JSON.parse(await AsyncStorage.getItem(key) || '{}');
          if (user.email === credentials.email) {
            const isValid = await this.verifyPassword(credentials.password, user.hashedPassword);
            if (isValid) {
              await AsyncStorage.setItem('currentUser', user.id);
              return user;
            }
          }
        }
      }
      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userId = await AsyncStorage.getItem('currentUser');
      if (!userId) return null;
      const user = await AsyncStorage.getItem(`user_${userId}`);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const user = await AsyncStorage.getItem(`user_${userId}`);
      if (!user) throw new Error('User not found');
      
      const updatedUser = { ...JSON.parse(user), ...updates };
      await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`user_${userId}`);
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 