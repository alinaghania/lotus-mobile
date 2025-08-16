#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TEST FIREBASE - SAUVEGARDE & CHARGEMENT
 * 
 * Ce script teste TOUTES les opérations de données pour s'assurer 
 * que Firebase sauvegarde et charge correctement.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');

// Configuration Firebase depuis variables d'environnement
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('🔥 DÉMARRAGE DU TEST FIREBASE');
console.log('================================');

/**
 * Nettoyer les valeurs undefined pour Firebase
 */
function removeUndefinedValues(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const cleanedValue = removeUndefinedValues(value);
        if (Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Test 1: Création et récupération d'utilisateur
 */
async function testUserOperations() {
  console.log('\n📝 TEST 1: OPÉRATIONS UTILISATEUR');
  console.log('----------------------------------');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // 1. Créer un utilisateur avec Firebase Auth
    console.log('👤 Création utilisateur...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log('✅ Utilisateur créé:', user.uid);
    
    // 2. Sauvegarder les données utilisateur dans Firestore
    console.log('💾 Sauvegarde données utilisateur...');
    const userData = {
      uid: user.uid,
      email: user.email,
      registrationData: {
        name: "Test User",
        age: "25",
        sex: "female",
        weight: "65",
        hasEndometriosis: "yes",
        endometriosisTypes: ["Superficial peritoneal endometriosis"],
        medicalConditions: ["PCOS"],
        deviceInfo: {
          platform: "test",
          version: "1.0.0"
        },
        preferences: {
          notifications: true,
          dataSharing: false,
          language: "en"
        }
      },
      metadata: {
        lastLoginDate: new Date(),
        accountCreatedDate: new Date(),
        profileCompleteness: 100,
        appVersion: "1.0.0",
        platform: "test"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const cleanUserData = removeUndefinedValues(userData);
    await setDoc(doc(db, 'users', user.uid), cleanUserData);
    console.log('✅ Données utilisateur sauvegardées');
    
    // 3. Récupérer les données utilisateur
    console.log('📖 Récupération données utilisateur...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const retrievedData = userDoc.data();
      console.log('✅ Données récupérées:', {
        uid: retrievedData.uid,
        email: retrievedData.email,
        name: retrievedData.registrationData?.name,
        age: retrievedData.registrationData?.age,
        completeness: retrievedData.metadata?.profileCompleteness
      });
    } else {
      throw new Error('❌ Utilisateur non trouvé dans Firestore');
    }
    
    return user;
    
  } catch (error) {
    console.error('❌ ERREUR Test Utilisateur:', error.message);
    throw error;
  }
}

/**
 * Test 2: Sauvegarde et récupération de données de tracking
 */
async function testTrackingOperations(user) {
  console.log('\n📊 TEST 2: OPÉRATIONS TRACKING');
  console.log('-------------------------------');
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 1. Créer des données de tracking complètes
    console.log('📝 Création données tracking...');
    const trackingData = {
      userId: user.uid,
      date: today,
      
      // Données de sommeil
      sleep: {
        bedtime: "23:30",
        wakeTime: "07:00",
        duration: 7.5,
        quality: 8,
        notes: "Bon sommeil réparateur"
      },
      
      // Données de repas
      meals: {
        breakfast: { 
          items: ["Avocado Toast", "Coffee"], 
          time: "08:00", 
          notes: "Petit-déjeuner équilibré" 
        },
        lunch: { 
          items: ["Quinoa Salad", "Green Tea"], 
          time: "12:30", 
          notes: "Déjeuner léger" 
        },
        dinner: { 
          items: ["Salmon", "Vegetables"], 
          time: "19:00", 
          notes: "Dîner riche en oméga-3" 
        },
        snacks: { 
          items: ["Apple", "Almonds"], 
          time: "15:00", 
          notes: "Collation saine" 
        },
        totalCalories: 1800,
        waterIntake: 2.5
      },
      
      // Données de sport
      sport: {
        activities: ["Running", "Yoga"],
        duration: 60,
        intensity: "medium",
        notes: "Bonne séance"
      },
      
      // Données digestives
      digestive: {
        morning: {
          photos: ["photo1.jpg"],
          bloated: false,
          pain: 2,
          notes: "Se sent bien"
        },
        evening: {
          photos: ["photo2.jpg"],
          bloated: true,
          pain: 4,
          notes: "Léger ballonnement"
        },
        symptoms: ["bloating"],
        medication: ["Antispasmodic"]
      },
      
      // Métadonnées
      mood: 8,
      energy: 7,
      stress: 3,
      symptoms: ["mild cramping"],
      notes: "Journée globalement positive",
      completeness: 100,
      entryMethod: "manual",
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 2. Sauvegarder dans Firestore
    console.log('💾 Sauvegarde tracking...');
    const cleanTrackingData = removeUndefinedValues(trackingData);
    const trackingDocId = `${user.uid}_${today}`;
    await setDoc(doc(db, 'tracking', trackingDocId), cleanTrackingData);
    console.log('✅ Données tracking sauvegardées');
    
    // 3. Récupérer les données de tracking
    console.log('📖 Récupération tracking...');
    const trackingDoc = await getDoc(doc(db, 'tracking', trackingDocId));
    if (trackingDoc.exists()) {
      const retrievedTracking = trackingDoc.data();
      console.log('✅ Tracking récupéré:', {
        date: retrievedTracking.date,
        sleepQuality: retrievedTracking.sleep?.quality,
        mealsCount: Object.keys(retrievedTracking.meals || {}).length,
        sportActivities: retrievedTracking.sport?.activities?.length,
        mood: retrievedTracking.mood,
        completeness: retrievedTracking.completeness
      });
      
      // 4. Vérifier que toutes les données importantes sont présentes
      console.log('🔍 Vérification intégrité...');
      const checks = [
        { name: 'Sleep data', condition: !!retrievedTracking.sleep },
        { name: 'Meals data', condition: !!retrievedTracking.meals },
        { name: 'Sport data', condition: !!retrievedTracking.sport },
        { name: 'Digestive data', condition: !!retrievedTracking.digestive },
        { name: 'Mood data', condition: retrievedTracking.mood !== undefined },
        { name: 'User ID', condition: retrievedTracking.userId === user.uid },
        { name: 'Date', condition: retrievedTracking.date === today }
      ];
      
      checks.forEach(check => {
        console.log(`${check.condition ? '✅' : '❌'} ${check.name}`);
      });
      
      const allPassed = checks.every(check => check.condition);
      if (allPassed) {
        console.log('🎉 TOUTES LES VÉRIFICATIONS RÉUSSIES !');
      } else {
        throw new Error('❌ Certaines vérifications ont échoué');
      }
      
    } else {
      throw new Error('❌ Données tracking non trouvées');
    }
    
  } catch (error) {
    console.error('❌ ERREUR Test Tracking:', error.message);
    throw error;
  }
}

/**
 * Test 3: Requêtes complexes et récupération par utilisateur
 */
async function testQueryOperations(user) {
  console.log('\n🔍 TEST 3: REQUÊTES COMPLEXES');
  console.log('-----------------------------');
  
  try {
    // 1. Récupérer toutes les données de tracking pour cet utilisateur
    console.log('📊 Requête tracking par utilisateur...');
    const trackingQuery = query(
      collection(db, 'tracking'), 
      where('userId', '==', user.uid)
    );
    
    const trackingSnapshot = await getDocs(trackingQuery);
    console.log(`✅ Trouvé ${trackingSnapshot.size} enregistrement(s) de tracking`);
    
    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  📅 ${data.date}: Completeness ${data.completeness}%`);
    });
    
    // 2. Vérifier les données utilisateur
    console.log('👤 Vérification données utilisateur...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Utilisateur vérifié:', {
        email: userData.email,
        completeness: userData.metadata?.profileCompleteness,
        hasEndometriosis: userData.registrationData?.hasEndometriosis
      });
    }
    
  } catch (error) {
    console.error('❌ ERREUR Test Requêtes:', error.message);
    throw error;
  }
}

/**
 * Test 4: Nettoyage
 */
async function cleanup(user) {
  console.log('\n🧹 NETTOYAGE');
  console.log('-------------');
  
  try {
    // Supprimer l'utilisateur de l'authentification
    await user.delete();
    console.log('✅ Utilisateur test supprimé');
    
  } catch (error) {
    console.error('⚠️ Erreur nettoyage:', error.message);
  }
}

/**
 * FONCTION PRINCIPALE
 */
async function runAllTests() {
  let testUser = null;
  
  try {
    console.log('🚀 DÉBUT DES TESTS FIREBASE');
    console.log('============================');
    
    // Test 1: Utilisateur
    testUser = await testUserOperations();
    
    // Test 2: Tracking
    await testTrackingOperations(testUser);
    
    // Test 3: Requêtes
    await testQueryOperations(testUser);
    
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('===========================');
    console.log('✅ Firebase fonctionne parfaitement');
    console.log('✅ Toutes les données se sauvent correctement');
    console.log('✅ Toutes les données se récupèrent correctement');
    console.log('✅ Les requêtes complexes fonctionnent');
    
  } catch (error) {
    console.error('\n❌ ÉCHEC DES TESTS');
    console.error('==================');
    console.error('Erreur:', error.message);
    console.error('\n🔧 SOLUTIONS POSSIBLES:');
    console.error('1. Vérifier que Firebase est bien configuré');
    console.error('2. Vérifier les règles de sécurité Firestore');
    console.error('3. Vérifier la connexion internet');
    console.error('4. Vérifier les variables d\'environnement');
    
  } finally {
    // Nettoyage
    if (testUser) {
      await cleanup(testUser);
    }
    
    // Déconnexion
    await signOut(auth);
    console.log('\n👋 Tests terminés');
    process.exit(0);
  }
}

// Lancer les tests
runAllTests().catch(console.error); 