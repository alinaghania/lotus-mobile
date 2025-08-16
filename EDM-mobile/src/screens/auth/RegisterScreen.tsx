import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import { profileService } from '../../services/profileService';
import { firebaseService } from '../../services/firebaseService';
import MultiSelect from '../../components/MultiSelect';
import { endometriosisTypes, commonConditions } from '../../constants/healthOptions';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface RegisterScreenProps {
  navigation: NavigationProp<any>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  header: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subtitle: { color: '#6b7280', marginTop: 4, textAlign: 'center' },
  stepsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
  stepDotActive: { backgroundColor: '#111827' },
  sectionCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  errorText: { color: '#dc2626', textAlign: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  input: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 12, flex: 1 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
  inputField: { flex: 1, paddingVertical: 12, fontSize: 16 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  navBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  navBtnPrimary: { backgroundColor: '#111827' },
  navBtnSecondary: { backgroundColor: '#e5e7eb' },
  navBtnTextPrimary: { color: 'white', fontWeight: '600' },
  navBtnTextSecondary: { color: '#374151', fontWeight: '600' },
  loginText: { color: '#6b7280', textAlign: 'center', marginTop: 16 },
  loginLink: { color: '#000', fontWeight: '500' },
  choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  choiceBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  choiceBtnActive: { backgroundColor: '#e5e7eb' },
  choiceText: { color: '#374151', fontWeight: '500' },
});

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [step, setStep] = useState(0); // 0: account, 1: basics, 2: health

  // Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Basics
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'female' | 'male' | 'other' | ''>('female');
  const [weight, setWeight] = useState('');

  // Health
  const [hasEndo, setHasEndo] = useState<'yes' | 'no'>('no');
  const [endoType, setEndoType] = useState<string[]>([]);
  const [menopause, setMenopause] = useState<'yes' | 'no'>('no');
  const [conditions, setConditions] = useState<string[]>([]);

  const [error, setError] = useState('');
  const { register } = useAuth();

  const isAccountValid = () => name.trim() && email.trim() && password.length >= 6 && password === confirmPassword;
  const isBasicsValid = () => true; // optional fields, always allow next
  const isHealthValid = () => true;

  const next = () => {
    setError('');
    if (step === 0 && !isAccountValid()) {
      setError(password !== confirmPassword ? 'Passwords do not match' : 'Fill name, email and a 6+ char password');
      return;
    }
    if (step === 1 && !isBasicsValid()) return;
    setStep(s => Math.min(2, s + 1));
  };

  const back = () => {
    setError('');
    setStep(s => Math.max(0, s - 1));
  };

  const handleRegister = async () => {
    if (!isAccountValid()) {
      setError(password !== confirmPassword ? 'Passwords do not match' : 'Fill name, email and a 6+ char password');
      return;
    }
    try {
      setError('');
      const user = await register({ email, password, name });
      
      // Créer un profil COMPLET avec TOUTES les données pour analytics
      const completeUserData = {
        userId: user.id,
        email: email.trim(),
        username: name.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        
        registrationData: {
          age: age || undefined,
          sex: sex || undefined,
          weight: weight || undefined,
          hasEndometriosis: hasEndo,
          endometriosisTypes: endoType,
          isMenopause: menopause,
          medicalConditions: conditions,
          deviceInfo: {
            platform: Platform.OS,
            version: Constants.expoConfig?.version || '1.0.0'
          },
          preferences: {
            notifications: true,
            dataSharing: true,
            language: 'en'
          }
        },
        
        metadata: {
          lastLoginDate: new Date(),
          accountCreatedDate: new Date(),
          profileCompleteness: calculateProfileCompleteness(),
          appVersion: Constants.expoConfig?.version || '1.0.0',
          platform: Platform.OS
        }
      };
      
      // Sauvegarder TOUTES les données dans Firebase
      await firebaseService.createUser(completeUserData);
      
      // Créer le profil legacy (pour compatibilité)
      await profileService.upsertProfile(user.id, {
        age: age ? parseInt(age) : undefined,
        sex,
        weightKg: weight ? parseFloat(weight) : undefined,
        hasEndometriosis: hasEndo === 'yes',
        endometriosisType: hasEndo === 'yes' ? (endoType[0] || 'Not sure yet') : undefined,
        menopause: menopause === 'yes',
        conditions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
      });
      
      navigation.navigate('Main');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
    }
  };
  
  // Calculer la complétude du profil pour analytics
  const calculateProfileCompleteness = (): number => {
    let completeness = 50; // Base pour email + nom
    
    if (age) completeness += 10;
    if (sex) completeness += 10;
    if (weight) completeness += 10;
    if (hasEndo && hasEndo !== 'no') completeness += 10;
    if (endoType.length > 0) completeness += 5;
    if (conditions.length > 0) completeness += 5;
    
    return Math.min(100, completeness);
  };

  const StepDots = () => (
    <View style={styles.stepsRow}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.stepDot, i === step && styles.stepDotActive]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>A few quick steps to personalize your experience</Text>
          <StepDots />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {step === 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <View style={styles.inputWithIcon}>
              <TextInput style={styles.inputField} placeholder="Password (min 6)" value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWithIcon}>
              <TextInput style={styles.inputField} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={next}>
                <Text style={styles.navBtnTextPrimary}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Basics</Text>
            <View style={styles.row}>
              <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>
            <View style={styles.choiceRow}>
              <TouchableOpacity onPress={() => setSex('female')} style={[styles.choiceBtn, sex === 'female' && styles.choiceBtnActive]}>
                <Text style={styles.choiceText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSex('other')} style={[styles.choiceBtn, sex === 'other' && styles.choiceBtnActive]}>
                <Text style={styles.choiceText}>Other</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={[styles.navBtn, styles.navBtnSecondary]} onPress={back}>
                <Text style={styles.navBtnTextSecondary}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={next}>
                <Text style={styles.navBtnTextPrimary}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Health</Text>
            <View style={styles.choiceRow}>
              <TouchableOpacity onPress={() => setHasEndo('yes')} style={[styles.choiceBtn, hasEndo === 'yes' && styles.choiceBtnActive]}>
                <Text style={styles.choiceText}>Endometriosis: Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHasEndo('no')} style={[styles.choiceBtn, hasEndo === 'no' && styles.choiceBtnActive]}>
                <Text style={styles.choiceText}>No</Text>
              </TouchableOpacity>
            </View>
            {hasEndo === 'yes' && (
              <MultiSelect label="Endometriosis type" options={endometriosisTypes} value={endoType} onChange={setEndoType} />
            )}
            <View style={{ height: 8 }} />
            <MultiSelect label="Other conditions" options={commonConditions} value={conditions} onChange={setConditions} allowOther />
            <View style={styles.choiceRow}>
              <TouchableOpacity onPress={() => setMenopause('yes')} style={[styles.choiceBtn, menopause === 'yes' && styles.choiceBtnActive]}>
                <Text style={styles.choiceText}>Menopause: Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenopause('no')} style={[styles.choiceBtn, menopause === 'no' && styles.choiceBtnActive]}>
                <Text style={styles.choiceText}>No</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={[styles.navBtn, styles.navBtnSecondary]} onPress={back}>
                <Text style={styles.navBtnTextSecondary}>Back</Text>
          </TouchableOpacity>
              <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={handleRegister}>
                <Text style={styles.navBtnTextPrimary}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 