import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  subtitle: { color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});

export default function OnboardingScreen({ navigation }: any) {
  const handleStart = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Lotus</Text>
        <Text style={styles.subtitle}>Track sleep, meals, sport, cycle, and symptoms with simple, clear insights.</Text>
        <TouchableOpacity onPress={handleStart} style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 