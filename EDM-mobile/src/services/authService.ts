import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';
import firebaseService from './firebaseService';

class AuthService {
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // 1. Créer l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      if (!userCredential.user) {
        throw new Error('Failed to create user');
      }

      const firebaseUser = userCredential.user;
      const userId = firebaseUser.uid;

      // 2. Mettre à jour le profil Firebase
      await updateProfile(firebaseUser, {
        displayName: credentials.name
      });

      // 3. Créer le document utilisateur dans Firestore
      await firebaseService.createUser({
        userId,
        email: credentials.email,
        username: credentials.name,
        createdAt: new Date()
      });

      // 4. Créer l'objet User local
      const user: User = {
        id: userId,
        email: credentials.email,
        name: credentials.name,
        hashedPassword: '' // Pas nécessaire avec Firebase Auth
      };

      // 5. Sauvegarder localement pour la session
      await AsyncStorage.setItem('currentUser', userId);
      await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(user));

      console.log('✅ User registered successfully with Firebase:', user.email);
      return user;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Messages d'erreur Firebase plus friendlies
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Un compte existe déjà avec cette adresse email');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      }
      
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // 1. Connexion avec Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      if (!userCredential.user) {
        throw new Error('Login failed');
      }

      const firebaseUser = userCredential.user;
      const userId = firebaseUser.uid;

      // 2. Récupérer les données utilisateur depuis Firestore
      const userData = await firebaseService.getUserById(userId);
      
      if (!userData) {
        // Si pas de données Firestore, créer le document avec les infos Firebase
        await firebaseService.createUser({
          userId,
          email: firebaseUser.email || credentials.email,
          username: firebaseUser.displayName || 'User',
          createdAt: new Date()
        });
      }

      // 3. Créer l'objet User local
      const user: User = {
        id: userId,
        email: firebaseUser.email || credentials.email,
        name: firebaseUser.displayName || userData?.username || 'User',
        hashedPassword: '' // Pas nécessaire avec Firebase Auth
      };

      // 4. Sauvegarder localement pour la session
      await AsyncStorage.setItem('currentUser', userId);
      await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(user));

      console.log('✅ User logged in successfully with Firebase:', user.email);
      return user;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Messages d'erreur Firebase plus friendlies
      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte trouvé avec cette adresse email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Ce compte a été désactivé');
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // 1. Déconnexion Firebase
      await signOut(auth);

      // 2. Nettoyer le stockage local
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (currentUser) {
        await AsyncStorage.removeItem('currentUser');
        await AsyncStorage.removeItem(`user_${currentUser}`);
      }

      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // 1. Vérifier l'état Firebase Auth
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return null;
      }

      // 2. Essayer de récupérer depuis le stockage local
      const userId = firebaseUser.uid;
      const storedUser = await AsyncStorage.getItem(`user_${userId}`);
      
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      // 3. Si pas en local, reconstruire depuis Firebase
      const userData = await firebaseService.getUserById(userId);
      
      const user: User = {
        id: userId,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || userData?.username || 'User',
        hashedPassword: ''
      };

      // Sauvegarder en local pour les prochaines fois
      await AsyncStorage.setItem('currentUser', userId);
      await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const firebaseUser = auth.currentUser;
      return firebaseUser !== null;
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      return false;
    }
  }

  // Listener pour les changements d'état d'authentification
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Utilisateur connecté
        try {
          const userData = await firebaseService.getUserById(firebaseUser.uid);
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || userData?.username || 'User',
            hashedPassword: ''
          };
          callback(user);
        } catch (error) {
          console.error('Error in auth state change:', error);
          callback(null);
        }
      } else {
        // Utilisateur déconnecté
        callback(null);
      }
    });
  }

  // Réinitialisation de mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte trouvé avec cette adresse email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      }
      
      throw error;
    }
  }

  // Mise à jour du profil
  async updateProfile(updates: { name?: string; email?: string }): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      // Mettre à jour Firebase Auth
      if (updates.name) {
        await updateProfile(firebaseUser, {
          displayName: updates.name
        });
      }

      if (updates.email) {
        await updateEmail(firebaseUser, updates.email);
      }

      // Mettre à jour Firestore
      await firebaseService.updateUser(firebaseUser.uid, {
        username: updates.name,
        email: updates.email
      });

      // Mettre à jour le stockage local
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: updates.name || currentUser.name,
          email: updates.email || currentUser.email
        };
        await AsyncStorage.setItem(`user_${firebaseUser.uid}`, JSON.stringify(updatedUser));
      }

      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService; 