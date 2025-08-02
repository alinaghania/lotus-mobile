import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Secrets {
  private static instance: Secrets;
  private secrets: { [key: string]: string } = {};

  private constructor() {}

  public static getInstance(): Secrets {
    if (!Secrets.instance) {
      Secrets.instance = new Secrets();
    }
    return Secrets.instance;
  }

  // Initialiser les secrets de manière sécurisée
  public async initialize() {
    try {
      // En production, ces valeurs devraient être chargées de manière sécurisée
      // par exemple via un service de gestion des secrets ou un backend sécurisé
      const mongoPassword = await AsyncStorage.getItem('MONGODB_PASSWORD');
      if (!mongoPassword) {
        // Première initialisation
        await this.setSecret('MONGODB_PASSWORD', 'Louboutingh@1');
      }
    } catch (error) {
      console.error('Error initializing secrets:', error);
    }
  }

  // Obtenir un secret
  public async getSecret(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting secret ${key}:`, error);
      return null;
    }
  }

  // Définir un secret
  private async setSecret(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting secret ${key}:`, error);
    }
  }

  // Obtenir l'URI MongoDB complet avec le mot de passe
  public async getMongoDB_URI(): Promise<string> {
    const password = await this.getSecret('MONGODB_PASSWORD');
    return `mongodb+srv://alina:${password}@cluster0.ihfhxbd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  }
}

export const secrets = Secrets.getInstance(); 