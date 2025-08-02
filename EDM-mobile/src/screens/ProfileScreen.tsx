import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProp } from '@react-navigation/native';

interface ProfileScreenProps {
  navigation: NavigationProp<any>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldLabel: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
  customizeButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  customizeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Name</Text>
          <Text style={styles.fieldValue}>{user?.name}</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('CharacterCustomization')}
          style={styles.customizeButton}
        >
          <Text style={styles.customizeButtonText}>
            Customize Your Lotus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 