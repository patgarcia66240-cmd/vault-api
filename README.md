# Vault API - Gestionnaire de Clés API

Plateforme complète de gestion de clés API construite avec les technologies web modernes.

## 🚀 Fonctionnalités

- **🔐 Authentification Sécurisée** - JWT avec cookies HttpOnly
- **🔑 Gestion de Clés API** - Créer, voir et révoquer des clés API avec chiffrement AES-256-GCM
- **💳 Intégration Stripe** - Gestion d'abonnements (Gratuit/PRO)
- **🎨 UI Glassmorphism** - Interface moderne et élégante avec Tailwind CSS
- **📱 Design Responsive** - Fonctionne parfaitement sur tous les appareils
- **🔒 Sécurité Avancée** - Rate limiting, protection CORS, secrets chiffrés

## 🛠 Stack Technique

### Frontend (apps/web)
- **React 18** + **TypeScript**
- **Vite** pour le développement rapide
- **React Router** pour la navigation
- **React Query** pour la gestion d'état serveur
- **Tailwind CSS** avec design glassmorphism
- **Axios** pour les appels API

### Backend (apps/server-python)
- **FastAPI** (Python 3.9+) + **Pydantic**
- **SQLAlchemy** ORM avec **PostgreSQL**
- **JWT** pour l'authentification
- **AES-256-GCM** pour le chiffrement
- **Stripe** pour les paiements
- **Pydantic** pour la validation

## 📁 Structure du Projet

```
vault-api/
├─ apps/
│  ├─ server-python/    # Backend FastAPI (Render/Railway)
│  │  ├─ app/
│  │  │  ├─ core/       # Config, database, security
│  │  │  ├─ models/     # SQLAlchemy models
│  │  │  ├─ routes/     # API endpoints
│  │  │  ├─ schemas/    # Pydantic schemas
│  │  │  └─ main.py     # FastAPI app entry
│  │  ├─ requirements.txt
│  │  ├─ start.sh / start.bat
│  │  └─ .env
│  └─ web/              # Frontend React (Vercel)
│     ├─ src/
│     │  ├─ components/ # Composants UI
│     │  ├─ pages/      # Pages React
│     │  └─ lib/        # Services & API client
├─ Dockerfile           # Configuration pour Render/Railway
├─ render.yaml          # Blueprint Render
├─ railway.json         # Configuration Railway
├─ vercel.json          # Configuration Vercel (frontend)
└─ package.json         # Configuration workspace
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Python 3.9+
- pnpm 8+

### Installation

1. **Cloner et installer les dépendances**
```bash
git clone <repository>
cd vault-api
pnpm install
```

2. **Configurer les variables d'environnement**

Backend (apps/server-python/.env):
```bash
cp apps/server-python/.env.example apps/server-python/.env
# Éditer apps/server-python/.env avec vos valeurs
```

Frontend (apps/web/.env):
```bash
cp apps/web/.env.example apps/web/.env
```

3. **Démarrer les serveurs de développement**

**Option 1 : Script rapide (Recommandé)**
```bash
# Windows
start-all.bat

# Linux/Mac
bash start-all.sh
```

**Option 2 : Commande pnpm**
```bash
pnpm start
```

**Option 3 : Démarrage séparé**
```bash
# Backend uniquement
pnpm dev:server      # Windows
pnpm dev:server:unix # Linux/Mac

# Frontend uniquement
pnpm dev:web         # Frontend sur :5173
```

> 📖 **Voir [START.md](START.md)** pour plus de détails sur les scripts de démarrage

## 🔐 Variables d'Environnement

### Backend (apps/server-python/.env)
```bash
ENVIRONMENT=development
PORT=8000
DATABASE_URL="postgresql+pg8000://user:pass@host/db?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key_at_least_32_characters"
CRYPTO_MASTER_KEY="base64_encoded_32_byte_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PRICE_PRO="price_your_pro_plan"
WEB_BASE_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,https://vault-api-web.vercel.app"
```

### Frontend (apps/web/.env)
```bash
VITE_API_URL=http://localhost:8000
```

## 📊 Endpoints API

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel

### Clés API
- `GET /api/apikeys` - Lister les clés API
- `POST /api/apikeys` - Créer une nouvelle clé API
- `GET /api/apikeys/:id` - Voir une clé API
- `DELETE /api/apikeys/:id` - Révoquer une clé API

## 🎨 Système de Design

L'application utilise un design glassmorphism moderne avec :
- **Couleurs** : Noir (#0a0a0a) + Jaune (#FFD400)
- **Typographie** : Police Inter
- **Composants** : Cartes et boutons glassmorphism
- **Animations** : Transitions fluides

## 🚢 Déploiement

L'application utilise une architecture séparée pour une meilleure scalabilité :

- **Frontend (React)** : Déployé sur **Netlify** ✅ *déjà déployé*
- **Backend (FastAPI)** : Déployé sur **Render** ✅ *déjà déployé*

### Application complète déployée 🎉

✅ **Frontend React** : https://vault-api-web.netlify.app
✅ **Backend FastAPI** : https://vault-api-dmzg.onrender.com

L'application est complète et opérationnelle avec :
- Frontend React hébergé sur Netlify avec CDN global
- Backend FastAPI avec base de données PostgreSQL
- Chiffrement AES-256-GCM pour les clés API
- Authentification JWT sécurisée
- Intégration Stripe pour les paiements

---

### Frontend : Netlify (Déjà déployé)

✅ **Le frontend est déjà déployé** sur : https://vault-api-web.netlify.app

#### Fichiers de configuration utilisés

- [netlify.toml](netlify.toml) : Configuration automatique du build et déploiement

#### Configuration actuelle

Le frontend utilise :
- **Build automatique** avec pnpm
- **Deploy previews** pour chaque PR/branche
- **CDN global** Netlify
- **Redirects** pour le routing React Router (SPA)

#### Pour mettre à jour le frontend

```bash
# Simple push sur main déclenche le déploiement automatique
git push origin main
```

#### Variables d'environnement configurées

- `VITE_API_URL` : https://vault-api-dmzg.onrender.com

---

### Configuration locale du frontend

Pour le développement local, configurez le fichier [apps/web/.env](apps/web/.env) :

```bash
# Pour le développement local (backend local)
VITE_API_URL=http://localhost:8000

# OU pour utiliser le backend déployé sur Render
VITE_API_URL=https://vault-api-dmzg.onrender.com
```

---

### Backend : Render (Déjà déployé)

✅ **Le backend est déjà déployé** sur : https://vault-api-dmzg.onrender.com

#### Fichiers de configuration utilisés

- [Dockerfile](Dockerfile) : Configuration Docker pour le service
- [render.yaml](render.yaml) : Blueprint pour le déploiement automatique

#### Configuration actuelle

Le backend utilise :
- **Runtime** : Docker avec Python 3.11
- **Base de données** : PostgreSQL (hébergée sur Render)
- **Port** : 8000

#### Pour mettre à jour le backend

```bash
# Simple push sur main déclenche le déploiement automatique
git push origin main
```

#### Variables d'environnement configurées

Les variables suivantes sont déjà configurées sur Render :
- `DATABASE_URL` : Connection string PostgreSQL
- `JWT_SECRET` : Clé secrète pour l'authentification
- `CRYPTO_MASTER_KEY` : Clé de chiffrement
- `STRIPE_SECRET_KEY` : Clé API Stripe
- `WEB_BASE_URL` : https://vault-api-web.netlify.app ✅
- `ALLOWED_ORIGINS` : https://vault-api-web.netlify.app ✅

---

### Backend : Railway (Alternative)

Non utilisé actuellement. Le [Dockerfile](Dockerfile) et [railway.json](railway.json) sont disponibles si vous souhaitez migrer.

Déployez facilement avec Railway en utilisant Docker ou le déploiement automatique.

#### Fichiers de configuration

- `Dockerfile` : Configuration Docker partagée avec Render
- `railway.json` : Configuration spécifique Railway

#### Déploiement avec Railway

```bash
# Installer Railway CLI
npm i -g railway

# Connecter à Railway
railway login

# Initialiser le projet
railway init

# Ajouter les variables d'environnement
railway variables set JWT_SECRET="votre_clé"
railway variables set CRYPTO_MASTER_KEY="votre_clé_crypto"
railway variables set STRIPE_SECRET_KEY="sk_live_votre_clé"
# ... autres variables

# Déployer
railway up
```

Ou via le dashboard Railway :

1. Cliquer sur **Deploy from GitHub repo**
2. Sélectionner votre repository
3. Railway détectera automatiquement le Dockerfile
4. Configurer les variables d'environnement dans l'onglet **Variables**
5. Ajouter un service **PostgreSQL** depuis le Marketplace
6. Le `DATABASE_URL` sera automatiquement injecté

#### Variables d'environnement Railway

Les mêmes que Render, mais Railway peut générer automatiquement le `DATABASE_URL` si vous ajoutez un service PostgreSQL.

---

## 📋 Résumé de l'architecture

| Composant | Plateforme | URL | Statut |
|-----------|-----------|-----|--------|
| **Frontend React** | Netlify | https://vault-api-web.netlify.app | ✅ Déployé |
| **Backend FastAPI** | Render | https://vault-api-dmzg.onrender.com | ✅ Déployé |
| **PostgreSQL** | Render | - | ✅ Configuré |

### Architecture actuelle

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend      │  HTTP   │     Backend      │  SQL   │  Database   │
│   (React)       │ ──────→ │   (FastAPI)      │ ─────→ │ PostgreSQL  │
│    Netlify      │         │     Render       │         │   Render    │
└─────────────────┘         └──────────────────┘         └─────────────┘
      ✅ Actif                    ✅ Actif                    ✅ Actif
```

### Avantages de cette architecture

✅ **Application complète** : Frontend et backend opérationnels
✅ **Scalabilité indépendante** : Frontend et backend séparés
✅ **Performance optimale** : Frontend servi par le CDN Netlify
✅ **Backend continu** : Pas de limitations serverless (timeout, cold starts)
✅ **Coût réduit** : Plans gratuits généreux
✅ **CI/CD automatique** : Déploiement automatique à chaque push
✅ **Facile à maintenir** : Architecture claire et découplée

### Mises à jour

Pour mettre à jour l'application :

```bash
# Simple push sur main déclenche les déploiements automatiques
git push origin main
```

- Frontend Netlify : Déploiement automatique ✅
- Backend Render : Déploiement automatique ✅

## 📝 License

MIT License - voir fichier LICENSE pour détails.

---

Construit avec ❤️ pour Vault API.
