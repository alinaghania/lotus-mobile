import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/profile';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  navigation: NavigationProp<any>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#111827' },
  fieldRow: { flexDirection: 'row', gap: 12 },
  fieldLabel: { color: '#6b7280', fontSize: 14, marginBottom: 4 },
  fieldValue: { fontSize: 16, color: '#111827', fontWeight: '500', marginBottom: 12 },
  input: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 16, marginBottom: 12, flex: 1 },
  action: { backgroundColor: '#000', paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  actionText: { color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  secondary: { backgroundColor: '#e5e7eb' },
  secondaryText: { color: '#374151' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db' },
  chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  chipText: { color: '#374151', fontWeight: '600' },
  chipTextActive: { color: 'white', fontWeight: '600' },
});

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [hasEndo, setHasEndo] = useState<boolean | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const endoTypes = ['Superficial peritoneal','Ovarian','Deep infiltrating','Adenomyosis','Unspecified'];
  const goalOptions = ['Weight management','Reduce symptoms','Improve sleep','Increase activity','Balanced nutrition'];

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const p = await profileService.getProfile(user.id);
      setProfile(p || { userId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as UserProfile);
      setHasEndo(!!p?.hasEndometriosis);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    const updated = await profileService.upsertProfile(user.id, { ...profile, hasEndometriosis: !!hasEndo });
    setProfile(updated);
    setEdit(false);
  };

  const handleLogout = async () => { try { await logout(); } catch {} };

  const SexChip = ({ value }: { value: 'female' | 'male' | 'other' }) => (
    <TouchableOpacity
      onPress={() => setProfile(p => ({ ...(p as any), sex: value } as any))}
      style={[styles.chip, profile?.sex === value && styles.chipActive]}
    >
      <Text style={profile?.sex === value ? styles.chipTextActive : styles.chipText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <Text style={styles.fieldLabel}>Name</Text>
        <Text style={styles.fieldValue}>{user?.name}</Text>
        <Text style={styles.fieldLabel}>Email</Text>
        <Text style={styles.fieldValue}>{user?.email}</Text>

        <Text style={styles.sectionTitle}>Health</Text>
        {edit ? (
          <>
            <View style={styles.fieldRow}>
              <TextInput style={styles.input} placeholder="Age" value={profile?.age ? String(profile.age) : ''} onChangeText={(t) => setProfile(p => ({ ...(p as any), age: t ? parseInt(t) : undefined }) as any)} keyboardType="numeric" />
            </View>

            <Text style={styles.fieldLabel}>Sex</Text>
            <View style={styles.chipRow}>
              <SexChip value="female" />
              <SexChip value="male" />
              <SexChip value="other" />
            </View>

            <Text style={styles.fieldLabel}>Do you have endometriosis?</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity onPress={() => setHasEndo(true)} style={[styles.chip, hasEndo === true && styles.chipActive]}><Text style={hasEndo === true ? styles.chipTextActive : styles.chipText}>Yes</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { setHasEndo(false); setProfile(p => ({ ...(p as any), endometriosisType: '' }) as any); }} style={[styles.chip, hasEndo === false && styles.chipActive]}><Text style={hasEndo === false ? styles.chipTextActive : styles.chipText}>No</Text></TouchableOpacity>
            </View>
            {hasEndo && (
              <>
                <Text style={styles.fieldLabel}>Endometriosis type</Text>
                <View style={styles.chipRow}>
                  {endoTypes.map(t => (
                    <TouchableOpacity key={t} onPress={() => setProfile(p => ({ ...(p as any), endometriosisType: t }) as any)} style={[styles.chip, profile?.endometriosisType === t && styles.chipActive]}>
                      <Text style={profile?.endometriosisType === t ? styles.chipTextActive : styles.chipText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TextInput style={styles.input} placeholder="Goals" value={profile?.goals || ''} onChangeText={(t) => setProfile(p => ({ ...(p as any), goals: t }) as any)} />

            <Text style={styles.sectionTitle}>Cycle</Text>
            <View style={[styles.fieldRow, { alignItems: 'center' }]}> 
              <Text style={{ color: '#111827', fontWeight: '500' }}>Continuous pill</Text>
              <Switch
                value={!!profile?.cycle?.isOnContinuousPill}
                onValueChange={(val) => setProfile(p => ({ ...(p as any), cycle: { ...(p?.cycle || {}), isOnContinuousPill: val } }) as any)}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Average cycle length (days)"
              keyboardType="numeric"
              value={String(profile?.cycle?.averageCycleLengthDays || '')}
              onChangeText={(t) => setProfile(p => ({ ...(p as any), cycle: { ...(p?.cycle || {}), averageCycleLengthDays: t ? parseInt(t) : undefined } }) as any)}
            />

            <TouchableOpacity onPress={handleSave} style={styles.action}><Text style={styles.actionText}>Save Profile</Text></TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Age</Text>
            <Text style={styles.fieldValue}>{profile?.age ?? '-'}</Text>
            <Text style={styles.fieldLabel}>Sex</Text>
            <Text style={styles.fieldValue}>{profile?.sex ?? '-'}</Text>
            <Text style={styles.fieldLabel}>Endometriosis</Text>
            <Text style={styles.fieldValue}>{profile?.hasEndometriosis ? (profile?.endometriosisType || 'Yes') : 'No'}</Text>
            <Text style={styles.fieldLabel}>Goals</Text>
            <Text style={styles.fieldValue}>{profile?.goals ?? '-'}</Text>

            <Text style={styles.sectionTitle}>Cycle</Text>
            <Text style={styles.fieldLabel}>Continuous pill</Text>
            <Text style={styles.fieldValue}>{profile?.cycle?.isOnContinuousPill ? 'Yes' : 'No'}</Text>
            <Text style={styles.fieldLabel}>Average cycle length</Text>
            <Text style={styles.fieldValue}>{profile?.cycle?.averageCycleLengthDays ?? '-'}</Text>
          </>
        )}

        <TouchableOpacity onPress={() => setEdit(e => !e)} style={[styles.action, styles.secondary]}>
          <Text style={[styles.actionText, styles.secondaryText]}>{edit ? 'Cancel' : 'Edit Profile'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setWizardOpen(true); setWizardStep(0); }} style={styles.action}>
          <Text style={styles.actionText}>Open Profile Wizard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Levels')} style={styles.action}>
          <Text style={styles.actionText}>Levels & Rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={[styles.action, styles.secondary]}>
          <Text style={[styles.actionText, styles.secondaryText]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Wizard Modal */}
      <Modal visible={wizardOpen} transparent onRequestClose={() => setWizardOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, width: '100%', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Profile Wizard</Text>
              <TouchableOpacity onPress={() => setWizardOpen(false)}><Ionicons name="close" size={20} color="#6b7280" /></TouchableOpacity>
            </View>
            <View style={{ marginTop: 12 }}>
              {wizardStep === 0 && (
                <>
                  <Text style={styles.fieldLabel}>Sex</Text>
                  <View style={styles.chipRow}>
                    <SexChip value="female" />
                    <SexChip value="male" />
                    <SexChip value="other" />
                  </View>
                </>
              )}
              {wizardStep === 1 && (
                <>
                  <Text style={styles.fieldLabel}>Do you have endometriosis?</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity onPress={() => setHasEndo(true)} style={[styles.chip, hasEndo === true && styles.chipActive]}><Text style={hasEndo === true ? styles.chipTextActive : styles.chipText}>Yes</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { setHasEndo(false); setProfile(p => ({ ...(p as any), endometriosisType: '' }) as any); }} style={[styles.chip, hasEndo === false && styles.chipActive]}><Text style={hasEndo === false ? styles.chipTextActive : styles.chipText}>No</Text></TouchableOpacity>
                  </View>
                  {hasEndo && (
                    <>
                      <Text style={styles.fieldLabel}>Endometriosis type</Text>
                      <View style={styles.chipRow}>
                        {endoTypes.map(t => (
                          <TouchableOpacity key={t} onPress={() => setProfile(p => ({ ...(p as any), endometriosisType: t }) as any)} style={[styles.chip, profile?.endometriosisType === t && styles.chipActive]}>
                            <Text style={profile?.endometriosisType === t ? styles.chipTextActive : styles.chipText}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}
              {wizardStep === 2 && (
                <>
                  <Text style={styles.fieldLabel}>Goals</Text>
                  <View style={styles.chipRow}>
                    {goalOptions.map(t => (
                      <TouchableOpacity key={t} onPress={() => setProfile(p => ({ ...(p as any), goals: t }) as any)} style={[styles.chip, profile?.goals === t && styles.chipActive]}>
                        <Text style={profile?.goals === t ? styles.chipTextActive : styles.chipText}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              {wizardStep === 3 && (
                <>
                  <Text style={styles.fieldLabel}>Regular periods?</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity onPress={() => setProfile(p => ({ ...(p as any), cycle: { ...(p?.cycle || {}), isRegular: true } }) as any)} style={[styles.chip, profile?.cycle?.isRegular === true && styles.chipActive]}><Text style={profile?.cycle?.isRegular ? styles.chipTextActive : styles.chipText}>Yes</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setProfile(p => ({ ...(p as any), cycle: { ...(p?.cycle || {}), isRegular: false } }) as any)} style={[styles.chip, profile?.cycle?.isRegular === false && styles.chipActive]}><Text style={profile?.cycle?.isRegular === false ? styles.chipTextActive : styles.chipText}>No</Text></TouchableOpacity>
                  </View>
                  <Text style={styles.fieldLabel}>Last period date (YYYY-MM-DD)</Text>
                  <TextInput style={styles.input} placeholder="2024-07-01" value={profile?.cycle?.lastPeriodDate || ''} onChangeText={(t) => setProfile(p => ({ ...(p as any), cycle: { ...(p?.cycle || {}), lastPeriodDate: t } }) as any)} />
                </>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setWizardStep(s => Math.max(0, s - 1))} style={{ padding: 10 }}>
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={async () => { await handleSave(); setWizardOpen(false); }} style={{ backgroundColor: '#111827', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setWizardStep(s => Math.min(3, s + 1))} style={{ backgroundColor: '#e5e7eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 }}>
                  <Text style={{ color: '#374151', fontWeight: '700' }}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 