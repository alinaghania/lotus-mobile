/**
 * 🔍 SCRIPT DE DEBUG FIREBASE SIMPLE
 * 
 * Lance ce script depuis l'app pour voir exactement ce qui se passe
 */

console.log('🔍 FIREBASE DEBUG HELPER');
console.log('========================');

// Fonction à appeler depuis l'app React Native
const debugSaveAndLoad = async (trackingService, date, userId) => {
  console.log('📝 DÉBUT DEBUG - Sauvegarde et chargement');
  console.log('Date:', date);
  console.log('User ID:', userId);
  
  try {
    // 1. Créer des données de test
    const testData = {
      date: date,
      sleep: {
        bedTime: "23:00",
        wakeTime: "07:00", 
        sleepDuration: 8,
        sleepQuality: 8
      },
      meals: {
        morning: "Toast,Coffee",
        afternoon: "Salad,Water",
        evening: "Pasta,Wine"
      }
    };
    
    console.log('💾 AVANT SAUVEGARDE:', JSON.stringify(testData, null, 2));
    
    // 2. Sauvegarder
    await trackingService.updateTracking(userId, date, testData);
    console.log('✅ Données sauvegardées');
    
    // 3. Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Charger
    const loadedData = await trackingService.getTrackingByDate(userId, date);
    console.log('📖 APRÈS CHARGEMENT:', JSON.stringify(loadedData, null, 2));
    
    // 5. Comparer
    console.log('🔍 COMPARAISON:');
    console.log('Sleep avant:', testData.sleep);
    console.log('Sleep après:', loadedData?.sleep);
    console.log('Meals avant:', testData.meals);
    console.log('Meals après:', loadedData?.meals);
    
    // 6. Vérifier si tout correspond
    const sleepMatch = JSON.stringify(testData.sleep) === JSON.stringify(loadedData?.sleep);
    const mealsMatch = JSON.stringify(testData.meals) === JSON.stringify(loadedData?.meals);
    
    console.log('✅ Sleep match:', sleepMatch);
    console.log('✅ Meals match:', mealsMatch);
    
    if (sleepMatch && mealsMatch) {
      console.log('🎉 SUCCÈS : Toutes les données correspondent !');
    } else {
      console.log('❌ PROBLÈME : Les données ne correspondent pas');
    }
    
  } catch (error) {
    console.error('❌ ERREUR DEBUG:', error);
  }
};

// Exporter pour utilisation dans l'app
global.debugFirebase = debugSaveAndLoad;

console.log('📱 Pour utiliser ce debug dans l\'app, ajoutez ceci dans TrackingScreen:');
console.log('');
console.log('import("../debugFirebase.js").then(() => {');
console.log('  global.debugFirebase(trackingService, selectedDate, user.id);');
console.log('});'); 