# 🌸 Lotus Health - EDM Tracking App

> **Une application mobile complète pour le suivi de l'endométriose et de la santé féminine**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-black)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.1.0-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## 📋 Table des Matières

- [🌸 Lotus Health - EDM Tracking App](#-lotus-health---edm-tracking-app)
  - [📋 Table des Matières](#-table-des-matières)
  - [🎯 Description](#-description)
  - [✨ Fonctionnalités](#-fonctionnalités)
  - [🏗️ Architecture](#️-architecture)
  - [🛠️ Technologies Utilisées](#️-technologies-utilisées)
  - [📱 Configuration & Installation](#-configuration--installation)
    - [Prérequis](#prérequis)
    - [Installation locale](#installation-locale)
  - [🔥 Configuration Firebase](#-configuration-firebase)
    - [1. Créer un projet Firebase](#1-créer-un-projet-firebase)
    - [2. Configurer Authentication](#2-configurer-authentication)
    - [3. Configurer Firestore](#3-configurer-firestore)
    - [4. Configurer Firebase Storage](#4-configurer-firebase-storage)
    - [5. Sécurité et Règles](#5-sécurité-et-règles)
  - [☁️ Déploiement sur AWS](#️-déploiement-sur-aws)
    - [Option 1: AWS Amplify (Recommandé)](#option-1-aws-amplify-recommandé)
    - [Option 2: AWS EC2 + EAS Build](#option-2-aws-ec2--eas-build)
    - [Option 3: AWS DevOps Pipeline](#option-3-aws-devops-pipeline)
  - [🔧 Variables d'Environnement](#-variables-denvironnement)
  - [📊 Structure des Données](#-structure-des-données)
    - [Collections Firestore](#collections-firestore)
    - [Analytics et Tracking](#analytics-et-tracking)
  - [🚀 Scripts Disponibles](#-scripts-disponibles)
  - [🔒 Sécurité](#-sécurité)
  - [📈 Monitoring & Analytics](#-monitoring--analytics)
  - [🤝 Contribution](#-contribution)
  - [📄 Licence](#-licence)

---

## 🎯 Description

**Lotus Health** est une application mobile native développée avec React Native et Expo, spécialement conçue pour le suivi de l'endométriose et de la santé féminine. L'application utilise Firebase comme backend cloud et propose un système complet de tracking avec analytics avancés.

### Points Clés
- 🩺 **Suivi médical complet** : sommeil, repas, sport, cycle menstruel, symptômes
- 🎮 **Gamification** : avatar personnalisable, système de niveaux et récompenses  
- 📊 **Analytics avancés** : suivi comportemental, métriques de santé, rapports détaillés
- 🔒 **Sécurité RGPD** : chiffrement des données, consentement utilisateur
- 🌍 **Multi-plateforme** : iOS, Android via Expo

---

## ✨ Fonctionnalités

### 🏠 Suivi Quotidien
- **Sommeil** : heures de coucher/réveil, qualité, durée, routines automatiques
- **Nutrition** : repas détaillés, calories, hydratation, photos des repas
- **Sport** : activités, durée, intensité, routines personnalisées
- **Cycle menstruel** : flux, douleurs, symptômes, prédictions
- **Digestif** : photos comparatives matin/soir, ballonnements, notes

### 👤 Personnalisation
- **Avatar évolutif** : customisation basée sur DiceBear
- **Routines intelligentes** : détection automatique, suggestions
- **Gamification** : points Endolots, niveaux, récompenses

### 📊 Analytics & Santé
- **Rapports détaillés** : graphiques de progression, corrélations
- **Export PDF** : rapports médicaux pour professionnels de santé
- **Tracking comportemental** : sessions utilisateur, actions, erreurs

---

## 🏗️ Architecture

```
📱 Frontend (React Native + Expo)
├── 🔐 Authentication (Firebase Auth)
├── 💾 Data Layer (Firestore + Local Storage)
├── 📸 File Storage (Firebase Storage)
├── 📊 Analytics (Custom + Firebase Analytics)
└── 🎮 UI/UX (NativeWind + Custom Components)

☁️ Backend (Firebase)
├── 👥 Users Collection (profiles, préférences)
├── 📋 Tracking Collection (données quotidiennes)
├── 📷 Photos Collection (métadonnées images)
├── 🔄 Routines Collection (automatisations)
├── 📊 Analytics Collections (sessions, activités)
└── 🔒 Security Rules (RGPD compliant)
```

---

## 🛠️ Technologies Utilisées

### Frontend
- **React Native** `0.79.5` - Framework mobile cross-platform
- **Expo** `53.0.20` - Plateforme de développement et déploiement
- **TypeScript** `5.x` - Langage typé pour JavaScript
- **NativeWind** `4.1.23` - Utility-first CSS pour React Native
- **React Navigation** `7.x` - Navigation et routing

### Backend & Services
- **Firebase** `12.1.0` - Backend-as-a-Service
  - **Authentication** - Gestion utilisateurs
  - **Firestore** - Base de données NoSQL
  - **Storage** - Stockage fichiers
  - **Security Rules** - Contrôle d'accès
- **AsyncStorage** - Cache local sécurisé

### Outils & DevOps
- **Expo EAS** - Build et déploiement
- **ESLint + Prettier** - Qualité de code
- **Jest** - Tests unitaires
- **Git** - Contrôle de version

---

## 📱 Configuration & Installation

### Prérequis

```bash
# Node.js (version 18+ recommandée)
node --version  # >= 18.0.0

# Expo CLI
npm install -g @expo/cli

# EAS CLI (pour les builds)
npm install -g eas-cli

# Git
git --version
```

### Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/votre-org/lotus-health-edm.git
cd lotus-health-edm/EDM-mobile

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Remplir les variables Firebase (voir section Configuration)

# 4. Lancer en développement
expo start

# 5. Scanner le QR code avec Expo Go (mobile)
# Ou utiliser un émulateur
expo start --ios     # iOS Simulator (macOS uniquement)
expo start --android # Android Emulator
```

---

## 🔥 Configuration Firebase

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer "Créer un projet"
3. Nom du projet : `lotus-health-prod` (ou autre)
4. Activer Google Analytics (recommandé)
5. Choisir la région : `europe-west1` (RGPD compliant)

### 2. Configurer Authentication

```bash
# Dans Firebase Console > Authentication > Sign-in method
1. Activer "Email/Password"
2. Activer "Comptes multiples par adresse e-mail" : NON
3. Configurer domaine autorisé : votre domaine de production
```

### 3. Configurer Firestore

```javascript
// Rules de sécurité Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - Accès restreint au propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tracking - Données sensibles, accès strict
    match /tracking/{trackingId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Photos - Métadonnées seulement
    match /photos/{photoId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Analytics - Collections système
    match /user_activities/{activityId} {
      allow write: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow read: if false; // Lecture interdite côté client
    }
    
    match /user_sessions/{sessionId} {
      allow write: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow read: if false;
    }
    
    match /routines/{routineId} {
      allow read, write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
```

### 4. Configurer Firebase Storage

```javascript
// Rules de sécurité Storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos utilisateurs - organisées par userId
    match /photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Avatars - lecture publique, écriture restreinte
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Sécurité et Règles

**Index Composites requis** (créés automatiquement via liens en console) :
- `tracking` : `userId` (Ascending) + `date` (Descending)
- `user_activities` : `userId` (Ascending) + `timestamp` (Descending)
- `user_sessions` : `userId` (Ascending) + `startTime` (Descending)

**Configuration du projet** :
```typescript
// src/config/firebase.ts
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "lotus-health-prod.firebaseapp.com",
  projectId: "lotus-health-prod",
  storageBucket: "lotus-health-prod.firebasestorage.app",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
  measurementId: "VOTRE_MEASUREMENT_ID"
};
```

---

## ☁️ Déploiement sur AWS

### Option 1: AWS Amplify (Recommandé)

**Avantages** : Simple, CI/CD automatique, SSL gratuit, CDN global

```bash
# 1. Installer AWS Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configurer AWS CLI
aws configure
# Entrer vos : AWS Access Key ID, Secret Access Key, Region (eu-west-1)

# 3. Initialiser Amplify
amplify init
# Nom du projet : lotus-health
# Environment : production
# Editor : Visual Studio Code
# App type : javascript
# Framework : react-native
# Source directory : .
# Distribution directory : dist
# Build command : expo build:web
# Start command : expo start

# 4. Ajouter l'hébergement
amplify add hosting
# Plugin : Amazon CloudFront and S3
# Hosting bucket name : lotus-health-prod-hosting

# 5. Build et déployer
expo build:web
amplify publish

# 6. Domaine personnalisé (optionnel)
amplify add storage
# Puis dans la console AWS Amplify, ajouter votre domaine
```

**Configuration Amplify** (`amplify.yml`) :
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
        - npm install -g @expo/cli
    build:
      commands:
        - expo build:web
  artifacts:
    baseDirectory: web-build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .expo/**/*
```

### Option 2: AWS EC2 + EAS Build

**Avantages** : Contrôle total, builds natifs iOS/Android

```bash
# 1. Créer une instance EC2
# Type : t3.medium (2 vCPU, 4GB RAM minimum)
# OS : Ubuntu 22.04 LTS
# Storage : 20GB GP3
# Security Group : SSH (22), HTTP (80), HTTPS (443)

# 2. Connexion et configuration
ssh -i votre-cle.pem ubuntu@votre-ip-ec2

# 3. Installation sur EC2
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 4. Cloner et configurer
git clone https://github.com/votre-org/lotus-health-edm.git
cd lotus-health-edm/EDM-mobile
npm install
npm install -g @expo/cli eas-cli

# 5. Configuration EAS
eas login
eas init
eas build:configure

# 6. Builds de production
eas build --platform android --profile production
eas build --platform ios --profile production

# 7. Déploiement automatique
eas submit --platform android --latest
eas submit --platform ios --latest
```

**Configuration EAS** (`eas.json`) :
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "releaseChannel": "production",
      "cache": {
        "disabled": false
      },
      "env": {
        "NODE_ENV": "production"
      }
    },
    "preview": {
      "releaseChannel": "preview",
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "votre-apple-id@example.com",
        "ascAppId": "VOTRE_ASC_APP_ID"
      }
    }
  }
}
```

### Option 3: AWS DevOps Pipeline

**Avantages** : CI/CD complet, tests automatisés, déploiement multi-environnements

```yaml
# buildspec.yml (AWS CodeBuild)
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm install -g @expo/cli eas-cli
      
  pre_build:
    commands:
      - npm ci
      - echo "Configuration Firebase..."
      - echo $FIREBASE_CONFIG > src/config/firebase-config.json
      
  build:
    commands:
      - echo "Building for production..."
      - expo build:web
      - echo "Running tests..."
      - npm test -- --coverage --watchAll=false
      
  post_build:
    commands:
      - echo "Build completed"
      - echo "Uploading to S3..."
      
artifacts:
  files:
    - '**/*'
  base-directory: web-build
  name: lotus-health-build

cache:
  paths:
    - 'node_modules/**/*'
    - '.expo/**/*'
```

**Pipeline CloudFormation** :
```yaml
# infrastructure/pipeline.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Lotus Health CI/CD Pipeline'

Resources:
  # S3 Bucket pour artifacts
  ArtifactsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-artifacts-${AWS::AccountId}'
      
  # CodeBuild Project
  BuildProject:
    Type: AWS::CodeBuild::Project
    Properties:
      Name: !Sub '${AWS::StackName}-build'
      ServiceRole: !GetAtt BuildRole.Arn
      Environment:
        Type: LINUX_CONTAINER
        ComputeType: BUILD_GENERAL1_MEDIUM
        Image: aws/codebuild/amazonlinux2-x86_64-standard:3.0
        
  # CodePipeline
  Pipeline:
    Type: AWS::CodePipeline::Pipeline
    Properties:
      Name: !Sub '${AWS::StackName}-pipeline'
      RoleArn: !GetAtt PipelineRole.Arn
      Stages:
        - Name: Source
          Actions:
            - Name: SourceAction
              ActionTypeId:
                Category: Source
                Owner: ThirdParty
                Provider: GitHub
                Version: '1'
                
        - Name: Build
          Actions:
            - Name: BuildAction
              ActionTypeId:
                Category: Build
                Owner: AWS
                Provider: CodeBuild
                Version: '1'
                
        - Name: Deploy
          Actions:
            - Name: DeployAction
              ActionTypeId:
                Category: Deploy
                Owner: AWS
                Provider: S3
                Version: '1'
```

---

## 🔧 Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```bash
# ==================== FIREBASE CONFIG ====================
FIREBASE_API_KEY=AIzaSyBXtCQGMDuBKe2cl--kpB1pzZgG6PSVOWI
FIREBASE_AUTH_DOMAIN=lotus-health-prod.firebaseapp.com
FIREBASE_PROJECT_ID=lotus-health-prod
FIREBASE_STORAGE_BUCKET=lotus-health-prod.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=129966476803
FIREBASE_APP_ID=1:129966476803:web:a6c93344ae033ed3b5c836
FIREBASE_MEASUREMENT_ID=G-WH4EVYNLVB

# ==================== APP CONFIG ====================
APP_ENV=production
APP_VERSION=1.0.0
API_TIMEOUT=30000

# ==================== FEATURES FLAGS ====================
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
ENABLE_PERFORMANCE_MONITORING=true

# ==================== AWS CONFIG (optionnel) ====================
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=votre-access-key
AWS_SECRET_ACCESS_KEY=votre-secret-key

# ==================== MONITORING ====================
SENTRY_DSN=https://votre-sentry-dsn@sentry.io/project-id
```

**⚠️ Sécurité** : 
- Jamais commiter le `.env` en production
- Utiliser AWS Secrets Manager ou Parameter Store pour les secrets
- Rotations des clés tous les 90 jours

---

## 📊 Structure des Données

### Collections Firestore

#### 👥 `users` Collection
```typescript
interface UserDocument {
  uid: string;
  email: string;
  registrationData: {
    name: string;
    age?: string;
    sex?: 'female' | 'male' | 'other';
    weight?: string;
    hasEndometriosis?: 'yes' | 'no';
    endometriosisTypes?: string[];
    medicalConditions?: string[];
    deviceInfo: {
      platform: string;
      version: string;
    };
    preferences: {
      notifications: boolean;
      dataSharing: boolean;
      language: string;
    };
  };
  character?: {
    skin: string;
    hair: string;
    level: number;
    endolots: number;
    healthPoints: number;
  };
  metadata: {
    lastLoginDate: Date;
    accountCreatedDate: Date;
    profileCompleteness: number;
    appVersion: string;
    platform: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### 📋 `tracking` Collection
```typescript
interface TrackingDocument {
  userId: string;
  date: string; // YYYY-MM-DD
  
  // Données de santé
  sleep?: {
    bedtime: string;
    wakeTime: string;
    duration: number;
    quality: number;
    routine?: string;
    notes?: string;
  };
  
  meals?: {
    breakfast?: { items: string[]; time?: string; notes?: string; };
    lunch?: { items: string[]; time?: string; notes?: string; };
    dinner?: { items: string[]; time?: string; notes?: string; };
    snacks?: { items: string[]; time?: string; notes?: string; };
    totalCalories?: number;
    waterIntake?: number;
  };
  
  sport?: {
    activities: string[];
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    notes?: string;
  };
  
  digestive?: {
    morning?: {
      photos?: string[];
      bloated?: boolean;
      pain?: number;
      notes?: string;
    };
    evening?: {
      photos?: string[];
      bloated?: boolean;
      pain?: number;
      notes?: string;
    };
    symptoms?: string[];
    medication?: string[];
  };
  
  // Métadonnées
  mood?: number; // 1-10
  energy?: number; // 1-10
  stress?: number; // 1-10
  symptoms?: string[];
  notes?: string;
  completeness: number; // 0-100%
  entryMethod: 'manual' | 'routine' | 'import';
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 📷 `photos` Collection
```typescript
interface PhotoDocument {
  userId: string;
  photoId: string;
  filename: string;
  url: string;
  type: 'digestive' | 'meal' | 'avatar';
  category: 'morning' | 'evening' | 'meal' | 'other';
  
  // Métadonnées
  date: string;
  timestamp: Date;
  fileSize: number;
  dimensions?: { width: number; height: number; };
  
  // Analytics
  uploadDuration?: number;
  viewCount: number;
  lastViewed?: Date;
  
  // Données médicales
  pain?: number;
  bloated?: boolean;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Analytics et Tracking

#### 📊 `user_activities` Collection
```typescript
interface UserActivityDocument {
  userId: string;
  activityId: string;
  action: string;
  category: 'auth' | 'tracking' | 'character' | 'navigation' | 'settings' | 'photo';
  details?: any;
  timestamp: Date;
  sessionId?: string;
  
  // Context
  screen?: string;
  platform: string;
  appVersion: string;
  duration?: number;
  success: boolean;
  errorMessage?: string;
}
```

#### 🔄 `user_sessions` Collection
```typescript
interface UserSessionDocument {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  screensVisited: string[];
  actionsCount: number;
  platform: string;
  appVersion: string;
  
  // Performance
  crashCount: number;
  dataUsage: number; // MB
  batteryLevel: number;
}
```

#### ⚙️ `routines` Collection
```typescript
interface RoutineDocument {
  userId: string;
  routineId: string;
  type: 'sleep' | 'sport' | 'meal';
  name: string;
  schedule: {
    days: string[];
    time?: string;
  };
  config?: {
    bedtime?: string;
    wakeTime?: string;
    duration?: number;
    activities?: Array<{
      type: string;
      duration: number;
      intensity?: string;
    }>;
  };
  
  // Analytics
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  lastUsed?: Date;
  effectiveness?: number; // 0-100%
}
```

---

## 🚀 Scripts Disponibles

```bash
# Développement
npm run start          # Démarrer Expo Dev Server
npm run dev           # Démarrer avec cache clear
npm run ios           # Lancer sur iOS Simulator
npm run android       # Lancer sur Android Emulator
npm run web           # Lancer sur navigateur web

# Build de production
npm run build:android # Build Android APK
npm run build:ios     # Build iOS IPA
eas build --platform all --profile production

# Tests et qualité
npm run test          # Tests unitaires Jest
npm run test:coverage # Tests avec couverture
npm run lint          # ESLint
npm run type-check    # TypeScript check

# Déploiement
eas submit --platform android --latest  # Play Store
eas submit --platform ios --latest      # App Store
amplify publish                          # AWS Amplify

# Maintenance
npm run clean         # Nettoyer cache
npm audit             # Audit sécurité
npm outdated          # Dépendances obsolètes
```

---

## 🔒 Sécurité

### 🛡️ Authentification
- **Firebase Auth** avec Email/Password
- **Validation** côté client et serveur
- **Rate limiting** intégré Firebase
- **Récupération mot de passe** sécurisée

### 🔐 Données Sensibles
- **Chiffrement** en transit (HTTPS/TLS)
- **Chiffrement** au repos (Firebase)
- **Isolation** des données par utilisateur
- **Audit trail** complet dans analytics

### 🚫 Sécurité Firestore
```javascript
// Règles strictes par défaut
allow read, write: if request.auth != null && 
  request.auth.uid == resource.data.userId;

// Validation des données
allow write: if isValidUserData(request.resource.data);

function isValidUserData(data) {
  return data.keys().hasAll(['userId', 'date']) &&
         data.userId is string &&
         data.date matches /^\d{4}-\d{2}-\d{2}$/;
}
```

### 🔍 Conformité RGPD
- **Consentement** explicite collecté
- **Export données** utilisateur (format JSON)
- **Suppression** complète sur demande
- **Anonymisation** des analytics
- **Localisation** données EU (région europe-west1)

### 🚨 Monitoring de Sécurité
```typescript
// Détection anomalies
if (loginAttempts > 5) {
  await trackSecurityEvent('suspicious_login', userId);
  await lockAccount(userId, '15min');
}

// Audit accès données
await trackDataAccess({
  userId,
  collection: 'tracking',
  action: 'read',
  timestamp: new Date(),
  ipAddress: request.ip
});
```

---

## 📈 Monitoring & Analytics

### 🔥 Firebase Analytics
```typescript
// Événements personnalisés
logEvent('health_data_entry', {
  type: 'sleep',
  completeness: 80,
  method: 'manual'
});

// Métriques utilisateur
setUserProperty('endometriosis_type', 'superficial');
setUserId(userId);
```

### 📊 Tableaux de Bord

**Métriques Clés** :
- 👥 **Utilisateurs actifs** (quotidien/mensuel)
- 📱 **Rétention** (D1, D7, D30)
- 💾 **Données trackées** par utilisateur
- ⚡ **Performance** (temps de chargement)
- 🐛 **Erreurs** et crashes
- 🔒 **Sécurité** (tentatives login, accès refusés)

**Dashboard AWS CloudWatch** :
```yaml
# Métriques personnalisées
UserEngagement:
  - ActiveUsers1Day
  - ActiveUsers7Days
  - DataEntriesPerUser
  - SessionDuration

HealthMetrics:
  - TrackingCompleteness
  - RoutineAdherence
  - PhotoUploads
  - SymptomFrequency

TechnicalMetrics:
  - AppLoadTime
  - FirebaseLatency
  - CrashRate
  - ApiErrorRate
```

### 🚨 Alertes
```yaml
# CloudWatch Alarms
HighErrorRate:
  threshold: > 5%
  action: SNS notification + PagerDuty

LowRetention:
  threshold: < 60% D7
  action: Product team notification

SecurityBreach:
  threshold: > 10 failed logins/min
  action: Immediate security team alert
```

---

## 🤝 Contribution

### 🌿 Git Workflow
```bash
# 1. Feature branch
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développement
# ... code + tests

# 3. Commit conventionnel
git commit -m "feat(tracking): add digestive photo comparison

- Add morning/evening photo capture
- Implement bloating detection algorithm
- Add GDPR compliant photo storage
- Update analytics for photo interactions

Closes #123"

# 4. Push et PR
git push origin feature/nouvelle-fonctionnalite
# Créer Pull Request avec template
```

### 📋 PR Template
```markdown
## 🎯 Description
Brief description of changes

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing on iOS
- [ ] Manual testing on Android
- [ ] Firebase rules tested

## 🔒 Security
- [ ] No sensitive data exposed
- [ ] GDPR compliance verified
- [ ] Security rules updated

## 📱 UX/UI
- [ ] Responsive design
- [ ] Accessibility tested
- [ ] Dark mode compatible
- [ ] Internationalization ready

## 📊 Analytics
- [ ] Tracking events added
- [ ] Performance metrics considered
- [ ] Error handling implemented
```

### 🏗️ Code Standards
```typescript
// ✅ Good
interface UserProfile {
  userId: string;
  email: string;
  createdAt: Date;
}

const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await firebaseService.createUser(profile);
    activityTrackingService.trackActivity({
      action: 'profile_created',
      category: 'auth',
      success: true
    });
  } catch (error) {
    activityTrackingService.trackError(error, 'ProfileScreen', 'save_profile');
    throw error;
  }
};

// ❌ Bad
const saveUser = async (data: any) => {
  await firebase.collection('users').add(data);
};
```

---

## 📄 Licence

```
MIT License

Copyright (c) 2025 Lotus Health

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

- 📧 **Email** : support@lotus-health.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-org/lotus-health-edm/issues)
- 📖 **Documentation** : [docs.lotus-health.com](https://docs.lotus-health.com)
- 💬 **Discord** : [Communauté Lotus Health](https://discord.gg/lotus-health)

---

<div align="center">

**🌸 Fait avec ❤️ pour la santé féminine**

[![Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Powered%20by-Firebase-FFCA28.svg?style=flat&logo=firebase)](https://firebase.google.com/)
[![AWS](https://img.shields.io/badge/Deployed%20on-AWS-FF9900.svg?style=flat&logo=amazon-aws)](https://aws.amazon.com/)

</div>
