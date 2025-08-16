# 🔒 Guide de Configuration Sécurisée

## 🚨 IMPORTANT : Credentials exposés nettoyés !

Nous avons détecté et **supprimé tous les credentials** de l'historique Git pour votre sécurité.

## 🔧 Configuration Requise

### 1. 🔥 **Régénérer vos clés Firebase (OBLIGATOIRE)**

Les anciennes clés ont été exposées. Vous DEVEZ les régénérer :

1. Aller sur [Firebase Console](https://console.firebase.google.com/project/lotus-edm/settings/general/)
2. Cliquer sur l'icône **⚙️ Settings**
3. Onglet **General** > **Your apps** 
4. Cliquer sur votre app web
5. **Régénérer** l'API Key
6. Noter les nouvelles valeurs

### 2. 🗝️ **Régénérer votre clé OpenAI (OBLIGATOIRE)**

Votre clé OpenAI a aussi été exposée :

1. Aller sur [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Révoquer** l'ancienne clé : `sk-proj-EXRbBR4e7ctpJYPUIC-Br...`
3. **Créer** une nouvelle clé
4. Noter la nouvelle valeur

### 3. 📝 **Créer votre fichier .env local**

```bash
# Dans EDM-mobile/
cp .env.example .env
```

Puis éditez `.env` avec vos **NOUVELLES** credentials :

```bash
# ==================== FIREBASE CONFIG ====================
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy[VOTRE_NOUVELLE_CLE]
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=lotus-edm.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=lotus-edm
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=lotus-edm.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[VOTRE_SENDER_ID]
EXPO_PUBLIC_FIREBASE_APP_ID=[VOTRE_APP_ID]  
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=[VOTRE_MEASUREMENT_ID]

# ==================== OPENAI (OPTIONNEL) ====================
OPENAI_API_KEY=sk-proj-[VOTRE_NOUVELLE_CLE]
```

### 4. ✅ **Vérifier la sécurité**

```bash
# Le .env NE DOIT PAS être tracké par Git
git status
# .env ne doit PAS apparaître dans les fichiers à commiter

# Vérifier que .env est bien ignoré
cat .gitignore | grep ".env"
```

## 🛡️ **Mesures de Sécurité Appliquées**

- ✅ **Historique Git nettoyé** - Credentials supprimés de tous les commits
- ✅ **Configuration par variables d'environnement** - Plus de hardcoding
- ✅ **Template .env.example** - Guide sans credentials réels
- ✅ **.gitignore** mis à jour - .env exclu du versioning
- ✅ **Validation runtime** - Erreurs claires si credentials manquants

## ⚠️ **À NE JAMAIS FAIRE**

- ❌ Commiter des fichiers `.env` ou credentials
- ❌ Hardcoder des API keys dans le code source  
- ❌ Partager des credentials par email/chat
- ❌ Utiliser des credentials en production sans rotation

## 🚀 **Pour Déploiement Production**

Utilisez AWS Secrets Manager ou des variables d'environnement sécurisées :

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name "lotus-health/firebase" \
  --secret-string '{"apiKey":"...","projectId":"..."}'

# Expo EAS Secrets
eas secret:create --name FIREBASE_API_KEY --value "your-key"
```

## 📞 **Besoin d'aide ?**

Si vous avez des questions sur la sécurité :
- 📧 Email: security@lotus-health.com  
- 🔐 [Guide de sécurité complet](https://docs.lotus-health.com/security) 