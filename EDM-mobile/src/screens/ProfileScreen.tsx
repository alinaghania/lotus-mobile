import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/profile';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps { navigation: NavigationProp<any>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 16 },
  button: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, marginBottom: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  primary: { backgroundColor: '#ef4444' },
  primaryText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  neutral: { backgroundColor: '#111827' },
  neutralText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  outline: { backgroundColor: '#f3f4f6' },
  outlineText: { color: '#111827', fontWeight: '700', fontSize: 16 },

  // Wizard styles
  wizardCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, width: '100%' },
  wizardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wizardTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 8, gap: 16 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#ef4444' },
  stepDotDone: { backgroundColor: '#ef4444' },
  stepDotPending: { backgroundColor: '#e5e7eb' },
  stepText: { color: 'white', fontWeight: '800' },
  input: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginTop: 10, color: '#111827' },
  inputError: { borderWidth: 1, borderColor: '#ef4444' },
  label: { color: '#111827', fontWeight: '600', marginTop: 12 },
  requiredStar: { color: '#ef4444', fontWeight: '700' },
  helper: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  radioRow: { marginTop: 8, gap: 8 },
  radio: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  radioBox: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#9ca3af', alignItems: 'center', justifyContent: 'center' },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  chipText: { color: '#374151', fontWeight: '600' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  navBtnDisabled: { backgroundColor: '#f3f4f6' },
  navBtnPrimary: { backgroundColor: '#ef4444' },
  navBtnTextPrimary: { color: 'white', fontWeight: '800' },
  navBtnTextDisabled: { color: '#6b7280', fontWeight: '700' },
  errorBanner: { backgroundColor: '#fee2e2', borderColor: '#fecaca', borderWidth: 1, padding: 10, borderRadius: 10, marginTop: 10 },
  errorText: { color: '#b91c1c', fontWeight: '700' },
});

const CONDITIONS = [
  "Irritable bowel syndrome",
  "Fibromyalgia",
  "Chronic migraines",
  "Anxiety/Depression",
  "Sleep disorders",
  "PCOS (polycystic ovary syndrome)",
  "Thyroid",
  "Other",
];

const ENDO_TYPES = [
  'Superficial endometriosis',
  'Ovarian endometrioma',
  'Deep infiltrating endometriosis',
  'Adenomyosis',
  'Unspecified'
];

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Wizard state
  const [openWizard, setOpenWizard] = useState(false);
  const [step, setStep] = useState(1); // 1..4
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [hasEndo, setHasEndo] = useState<'diagnosed' | 'not_diagnosed' | 'investigation' | undefined>(undefined);

  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showFieldErrors, setShowFieldErrors] = useState(false);

  const isNonEmpty = (v?: string) => !!(v && v.trim());
  const isDate = (v?: string) => !!(v && /^\d{2}\/\d{2}\/\d{4}$/.test(v.trim()));

  const stepValid = useMemo(() => {
    if (step === 1) {
      return isNonEmpty(form.firstName as any)
        && isNonEmpty(form.lastName as any)
        && isNonEmpty(form.email as any)
        && isNonEmpty(form.phone as any)
        && isDate(form.dateOfBirth as any);
    }
    if (step === 2) {
      const baseOk = (Number(form.weightKg) > 0) && (Number(form.heightCm) > 0) && !!hasEndo;
      if (!baseOk) return false;
      if (hasEndo === 'diagnosed' || hasEndo === 'investigation') {
        return isNonEmpty(form.endometriosisType as any) && isDate(form.diagnosisDate as any);
      }
      return true;
    }
    if (step === 3) {
      return selectedConditions.length > 0 && isNonEmpty(form.medications as any) && isNonEmpty(form.allergiesNotes as any);
    }
    if (step === 4) {
      return goals.length > 0;
    }
    return false;
  }, [step, form, hasEndo, selectedConditions, goals]);

  useEffect(() => { setErrorMsg(''); setShowFieldErrors(false); }, [step]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const p = await profileService.getProfile(user.id);
      setProfile(p);
      setForm({
        firstName: p?.firstName || '',
        lastName: p?.lastName || '',
        email: p?.email || user.email || '',
        phone: p?.phone || '',
        dateOfBirth: p?.dateOfBirth || '',
        weightKg: p?.weightKg,
        heightCm: p?.heightCm,
        endometriosisType: p?.endometriosisType || '',
        diagnosisDate: p?.diagnosisDate || '',
        medications: p?.medications || '',
        allergiesNotes: p?.allergiesNotes || '',
      });
      setSelectedConditions(p?.conditions || []);
      setGoals(p?.goalsList || []);
      setHasEndo(p?.diagnosisStatus);
    };
    load();
  }, [user]);

  const openWizardPrefilled = async () => {
    if (!user) return;
    const p = await profileService.getProfile(user.id);
    setProfile(p);
    setForm({
      firstName: p?.firstName || '',
      lastName: p?.lastName || '',
      email: p?.email || user.email || '',
      phone: p?.phone || '',
      dateOfBirth: p?.dateOfBirth || '',
      weightKg: p?.weightKg,
      heightCm: p?.heightCm,
      endometriosisType: p?.endometriosisType || '',
      diagnosisDate: p?.diagnosisDate || '',
      medications: p?.medications || '',
      allergiesNotes: p?.allergiesNotes || '',
    });
    setSelectedConditions(p?.conditions || []);
    setGoals(p?.goalsList || []);
    setHasEndo(p?.diagnosisStatus);
    setStep(1);
    setErrorMsg('');
    setShowFieldErrors(false);
    setOpenWizard(true);
  };

  const toggleCond = (name: string) => {
    setSelectedConditions(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const toggleGoal = (name: string) => {
    setGoals(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const computeMissingForStep = (): string[] => {
    const missing: string[] = [];
    if (step === 1) {
      if (!isNonEmpty(form.firstName as any)) missing.push('First name');
      if (!isNonEmpty(form.lastName as any)) missing.push('Last name');
      if (!isNonEmpty(form.email as any)) missing.push('Email');
      if (!isNonEmpty(form.phone as any)) missing.push('Phone');
      if (!isDate(form.dateOfBirth as any)) missing.push('Date of birth (dd/mm/yyyy)');
    } else if (step === 2) {
      if (!(Number(form.weightKg) > 0)) missing.push('Weight (kg)');
      if (!(Number(form.heightCm) > 0)) missing.push('Height (cm)');
      if (!hasEndo) missing.push('Endometriosis status');
      if (hasEndo === 'diagnosed' || hasEndo === 'investigation') {
        if (!isNonEmpty(form.endometriosisType as any)) missing.push('Endometriosis type');
        if (!isDate(form.diagnosisDate as any)) missing.push('Diagnosis date (dd/mm/yyyy)');
      }
    } else if (step === 3) {
      if (selectedConditions.length === 0) missing.push('Other diagnosed conditions');
      if (!isNonEmpty(form.medications as any)) missing.push('Current medications');
      if (!isNonEmpty(form.allergiesNotes as any)) missing.push('Known allergies');
    } else if (step === 4) {
      if (goals.length === 0) missing.push('Goals');
    }
    return missing;
  };

  const handleNext = () => {
    const missing = computeMissingForStep();
    if (missing.length > 0) {
      setShowFieldErrors(true);
      setErrorMsg(`Please fill the following: ${missing.join(', ')}`);
      return;
    }
    setErrorMsg('');
    setShowFieldErrors(false);
    setStep(s => Math.min(4, s + 1));
  };

  const saveProfile = async () => {
    if (!user) return;
    const missing = computeMissingForStep();
    if (missing.length > 0) {
      setShowFieldErrors(true);
      setErrorMsg(`Please fill the following: ${missing.join(', ')}`);
      return;
    }

    const updates: Partial<UserProfile> = {
      ...form,
      diagnosisStatus: hasEndo,
      hasEndometriosis: hasEndo === 'diagnosed' || hasEndo === 'investigation' ? true : false,
      conditions: selectedConditions,
      goalsList: goals,
    };
    const updated = await profileService.upsertProfile(user.id, updates);
    setProfile(updated);
    setOpenWizard(false);
  };

  // Helpers for error styling
  const err = (name: string): boolean => showFieldErrors && computeMissingForStep().some(m => m.toLowerCase().startsWith(name.toLowerCase()));

  const Label = ({ text, required = true }: { text: string; required?: boolean }) => (
    <Text style={styles.label}>{text}{required && <Text style={styles.requiredStar}> *</Text>}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Three main actions */}
        <TouchableOpacity onPress={openWizardPrefilled} style={[styles.button, styles.primary]}>
          <Ionicons name="create-outline" size={20} color="#ffffff" />
          <Text style={styles.primaryText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Levels' as never)} style={[styles.button, styles.neutral]}>
          <Ionicons name="ribbon-outline" size={20} color="#ffffff" />
          <Text style={styles.neutralText}>Levels & Rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('DigestiveScreen' as never)} style={[styles.button, styles.outline]}>
          <Ionicons name="medkit-outline" size={20} color="#111827" />
          <Text style={styles.outlineText}>Digestive Tracking</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Wizard Modal */}
      <Modal visible={openWizard} transparent animationType="fade" onRequestClose={() => setOpenWizard(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={styles.wizardCard}>
            <View style={styles.wizardHeader}>
              <Text style={styles.wizardTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setOpenWizard(false)}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Stepper */}
            <View style={styles.stepper}>
              {[1,2,3,4].map((n) => {
                const isDone = n < step;
                const isActive = n === step;
                return (
                  <View key={n} style={[styles.stepDot, isActive ? styles.stepDotActive : (isDone ? styles.stepDotDone : styles.stepDotPending)]}>
                    <Text style={styles.stepText}>{n}</Text>
                  </View>
                );
              })}
            </View>

            {errorMsg ? (
              <View style={styles.errorBanner}><Text style={styles.errorText}>{errorMsg}</Text></View>
            ) : null}

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {step === 1 && (
                <View>
                  <Text style={styles.helper}>All fields are required</Text>
                  <Label text="First name" />
                  <TextInput style={[styles.input, err('first name') && styles.inputError]} placeholder="Your first name" value={form.firstName as any} onChangeText={(t) => { setForm(p => ({ ...p, firstName: t })); setErrorMsg(''); }} />
                  <Label text="Last name" />
                  <TextInput style={[styles.input, err('last name') && styles.inputError]} placeholder="Your last name" value={form.lastName as any} onChangeText={(t) => { setForm(p => ({ ...p, lastName: t })); setErrorMsg(''); }} />
                  <Label text="Email" />
                  <TextInput style={[styles.input, err('email') && styles.inputError]} autoCapitalize="none" keyboardType="email-address" placeholder="your.email@example.com" value={form.email as any} onChangeText={(t) => { setForm(p => ({ ...p, email: t })); setErrorMsg(''); }} />
                  <Label text="Phone" />
                  <TextInput style={[styles.input, err('phone') && styles.inputError]} keyboardType="phone-pad" placeholder="06 12 34 56 78" value={form.phone as any} onChangeText={(t) => { setForm(p => ({ ...p, phone: t })); setErrorMsg(''); }} />
                  <Label text="Date of birth" />
                  <TextInput style={[styles.input, err('date of birth') && styles.inputError]} placeholder="dd/mm/yyyy" value={form.dateOfBirth as any} onChangeText={(t) => { setForm(p => ({ ...p, dateOfBirth: t })); setErrorMsg(''); }} />
                </View>
              )}

              {step === 2 && (
                <View>
                  <Text style={styles.helper}>All fields are required</Text>
                  <Label text="Weight (kg)" />
                  <TextInput style={[styles.input, err('weight') && styles.inputError]} keyboardType="numeric" placeholder="65" value={form.weightKg ? String(form.weightKg) : ''} onChangeText={(t) => { setForm(p => ({ ...p, weightKg: t ? parseFloat(t) : undefined })); setErrorMsg(''); }} />
                  <Label text="Height (cm)" />
                  <TextInput style={[styles.input, err('height') && styles.inputError]} keyboardType="numeric" placeholder="165" value={form.heightCm ? String(form.heightCm) : ''} onChangeText={(t) => { setForm(p => ({ ...p, heightCm: t ? parseInt(t) : undefined })); setErrorMsg(''); }} />

                  <Label text="Have you been diagnosed with endometriosis?" />
                  <View style={[styles.radioRow, err('endometriosis status') && { borderWidth: 1, borderColor: '#ef4444', borderRadius: 10, paddingHorizontal: 8 }]}>
                    {[
                      { key: 'diagnosed', label: 'Yes, diagnosed' },
                      { key: 'not_diagnosed', label: 'Not diagnosed' },
                      { key: 'investigation', label: 'Under investigation / Suspicion' },
                    ].map(opt => (
                      <TouchableOpacity key={opt.key} style={styles.radio} onPress={() => { setHasEndo(opt.key as any); setErrorMsg(''); }}>
                        <View style={styles.radioBox}>{hasEndo === (opt.key as any) && <View style={styles.radioFill} />}</View>
                        <Text style={{ color: '#111827' }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {(hasEndo === 'diagnosed' || hasEndo === 'investigation') && (
                    <>
                      <Label text="Endometriosis type" />
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {ENDO_TYPES.map(t => (
                          <TouchableOpacity key={t} style={[styles.chip, form.endometriosisType === t && styles.chipActive, err('endometriosis type') && { borderColor: '#ef4444' }]} onPress={() => { setForm(p => ({ ...p, endometriosisType: t })); setErrorMsg(''); }}>
                            <Text style={form.endometriosisType === t ? styles.chipTextActive : styles.chipText}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <Label text="Diagnosis date" />
                      <TextInput style={[styles.input, err('diagnosis date') && styles.inputError]} placeholder="dd/mm/yyyy" value={form.diagnosisDate as any} onChangeText={(t) => { setForm(p => ({ ...p, diagnosisDate: t })); setErrorMsg(''); }} />
                    </>
                  )}
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text style={styles.helper}>All fields are required</Text>
                  <Label text="Other diagnosed conditions (multi-select)" />
                  <ScrollView horizontal={false} style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {CONDITIONS.map(c => (
                        <TouchableOpacity key={c} onPress={() => { toggleCond(c); setErrorMsg(''); }} style={[styles.chip, selectedConditions.includes(c) && styles.chipActive, showFieldErrors && selectedConditions.length === 0 ? { borderColor: '#ef4444' } : null]}>
                          <Text style={selectedConditions.includes(c) ? styles.chipTextActive : styles.chipText}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  </ScrollView>

                  <Label text="Current medications" />
                  <TextInput style={[styles.input, { minHeight: 80 }, err('current medications') && styles.inputError]} multiline placeholder="List your current medications (pill, painkillers, etc.)" value={form.medications as any} onChangeText={(t) => { setForm(p => ({ ...p, medications: t })); setErrorMsg(''); }} />

                  <Label text="Known allergies" />
                  <TextInput style={[styles.input, { minHeight: 80 }, err('known allergies') && styles.inputError]} multiline placeholder="Drugs, foods, etc." value={form.allergiesNotes as any} onChangeText={(t) => { setForm(p => ({ ...p, allergiesNotes: t })); setErrorMsg(''); }} />
                </View>
              )}

              {step === 4 && (
                <View>
                  <Text style={styles.helper}>All fields are required</Text>
                  <Label text="Your goals (toggle)" />
                  {[
                    'Track my menstrual cycles',
                    'Manage my pain',
                    'Monitor my symptoms',
                    'Improve my nutrition',
                    'Optimize my sleep',
                    'Reduce stress',
                  ].map(g => (
                    <TouchableOpacity key={g} onPress={() => { toggleGoal(g); setErrorMsg(''); }} style={[styles.radio, { justifyContent: 'space-between' }, showFieldErrors && goals.length === 0 ? { borderWidth: 1, borderColor: '#ef4444', borderRadius: 10, paddingHorizontal: 8 } : null ]}>
                      <Text style={{ color: '#111827' }}>{g}</Text>
                      <Switch value={goals.includes(g)} onValueChange={() => { toggleGoal(g); setErrorMsg(''); }} />
                    </TouchableOpacity>
                  ))}
                  </View>
              )}
            </ScrollView>

            <View style={styles.navRow}>
              <TouchableOpacity disabled={step === 1} onPress={() => { setErrorMsg(''); setShowFieldErrors(false); setStep(s => Math.max(1, s - 1)); }} style={[styles.navBtn, styles.navBtnDisabled]}>
                <Text style={styles.navBtnTextDisabled}>Previous</Text>
              </TouchableOpacity>
              {step < 4 ? (
                <TouchableOpacity onPress={handleNext} style={[styles.navBtn, styles.navBtnPrimary]}>
                  <Text style={styles.navBtnTextPrimary}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={saveProfile} style={[styles.navBtn, styles.navBtnPrimary]}>
                  <Text style={styles.navBtnTextPrimary}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 