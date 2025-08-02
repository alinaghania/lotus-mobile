import { ObjectId } from 'mongodb';
import { connectDB, collections } from '../config/mongodb';
import { UserPreferences } from '../types/tracking';

interface User {
  _id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  // Create a new user
  async createUser(email: string, name: string): Promise<string> {
    const db = await connectDB();
    const defaultPreferences: UserPreferences = {
      notificationsEnabled: true,
      darkMode: false,
      privacyMode: true,
      reminderTime: '20:00'
    };

    const user = await db.collection(collections.users).insertOne({
      email,
      name,
      preferences: defaultPreferences,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return user.insertedId.toString();
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const db = await connectDB();
    const user = await db.collection(collections.users).findOne({
      _id: new ObjectId(id)
    });
    return user;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const db = await connectDB();
    const user = await db.collection(collections.users).findOne({ email });
    return user;
  },

  // Update user preferences
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    const db = await connectDB();
    const result = await db.collection(collections.users).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'preferences': preferences,
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  },

  // Update user profile
  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<boolean> {
    const db = await connectDB();
    const result = await db.collection(collections.users).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  },

  // Delete user account
  async deleteUser(userId: string): Promise<boolean> {
    const db = await connectDB();
    const result = await db.collection(collections.users).deleteOne({
      _id: new ObjectId(userId)
    });
    return result.deletedCount > 0;
  }
}; 