import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { connectDB, collections } from '../config/mongodb';
import { ObjectId } from 'mongodb';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Register for push notifications
  async registerForPushNotifications(userId: string) {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync()).data;

      // Save token to MongoDB
      const db = await connectDB();
      await db.collection(collections.users).updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            pushToken: token,
            updatedAt: new Date()
          }
        }
      );

      // Configure notifications on Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  },

  // Schedule a local notification
  async scheduleNotification(title: string, body: string, trigger: any = null) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger || null,
      });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  // Schedule daily reminder
  async scheduleDailyReminder(hour: number, minute: number) {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    return this.scheduleNotification(
      'Daily Health Tracking',
      "Don't forget to track your health data for today!",
      trigger
    );
  },

  // Schedule period reminder based on cycle
  async schedulePeriodReminder(expectedDate: Date) {
    const trigger = new Date(expectedDate);
    trigger.setDate(trigger.getDate() - 2); // 2 days before

    return this.scheduleNotification(
      'Period Reminder',
      'Your period might start in 2 days. Make sure to have supplies ready!',
      trigger
    );
  },

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Update notification settings
  async updateNotificationSettings(userId: string, settings: {
    dailyReminder: boolean;
    dailyReminderTime?: string;
    periodReminder: boolean;
  }) {
    try {
      const db = await connectDB();
      await db.collection(collections.users).updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            notificationSettings: settings,
            updatedAt: new Date()
          }
        }
      );

      // Cancel existing notifications
      await this.cancelAllNotifications();

      // Reschedule if enabled
      if (settings.dailyReminder && settings.dailyReminderTime) {
        const [hour, minute] = settings.dailyReminderTime.split(':').map(Number);
        await this.scheduleDailyReminder(hour, minute);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  },

  // Send notification to specific user
  async sendNotificationToUser(userId: string, title: string, body: string) {
    try {
      const db = await connectDB();
      const user = await db.collection(collections.users).findOne({
        _id: new ObjectId(userId)
      });

      if (!user?.pushToken) {
        console.log('User has no push token registered');
        return;
      }

      // In production, you would use a push notification service
      // For now, we'll use local notification
      await this.scheduleNotification(title, body);
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }
}; 