import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  label: { color: '#6b7280' },
  value: { color: '#111827', fontWeight: '600', fontSize: 16 },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: 8, backgroundColor: '#7c3aed' },
});

export default function LevelsScreen() {
  const [level, setLevel] = useState(1);
  const [endolots, setEndolots] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem('savedCharacter');
      if (raw) {
        const c = JSON.parse(raw);
        setLevel(c.level || 1);
        setEndolots(c.endolots || 0);
      }
      // Simple placeholder progression: based on daily completion percentage proxy
      setProgress(40);
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Levels & Rewards</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Level</Text>
          <Text style={styles.value}>{level}</Text>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} /></View>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Endolots</Text>
          <Text style={styles.value}>{endolots}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 