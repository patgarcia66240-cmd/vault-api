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
```bash
# Windows - Démarrer backend FastAPI
cd apps/server-python
start.bat

# Linux/Mac - Démarrer backend FastAPI
cd apps/server-python
bash start.sh

# Démarrer frontend React
pnpm dev:web     # Frontend sur :5173
```

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

- **Frontend (React)** : Déployé sur **Vercel** en site statique
- **Backend (FastAPI)** : Déployé sur **Render** ou **Railway** avec Docker

---

### Frontend : Vercel

Déployez le frontend React sur Vercel en tant que site statique.

#### Configuration

Le fichier [vercel.json](vercel.json) configure automatiquement le build et le déploiement.

#### Variables d'environnement Vercel

À configurer dans le dashboard Vercel :
```bash
VITE_API_URL=https://votre-backend.onrender.com
```

#### Déploiement

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

---

### Backend : Render (Service Web & Docker)

Déployez le serveur FastAPI comme un service web avec Docker.

#### Fichiers de configuration

- `Dockerfile` : Configuration Docker pour le service
- `render.yaml` : Configuration automatique du service et de la base de données

#### Déploiement avec Render

```bash
# Installer Render CLI
npm i -g render

# Connecter à Render
render login

# Déployer avec le blueprint
render blueprint launch
```

Ou manuellement via le dashboard :

1. Créer un **Web Service** sur Render
2. Connecter votre repository
3. Configurer :
   - **Runtime** : Docker
   - **Docker Context** : `/`
   - **Dockerfile Path** : `./Dockerfile`
4. Ajouter les variables d'environnement (voir ci-dessous)
5. Créer une **PostgreSQL Database**
6. Mettre à jour `DATABASE_URL` avec les credentials de la base

#### Variables d'environnement Render

```bash
ENVIRONMENT=production
PORT=8000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=votre_clé_secrète_32_caractères_min
CRYPTO_MASTER_KEY=clé_base64_32_bytes
STRIPE_SECRET_KEY=sk_live_votre_clé
STRIPE_WEBHOOK_SECRET=whsec_votre_secret
STRIPE_PRICE_PRO=price_votre_plan
WEB_BASE_URL=https://votre-frontend.vercel.app
ALLOWED_ORIGINS=https://votre-frontend.vercel.app
```

---

### Backend : Railway (Service & Docker)

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

| Composant | Plateforme | Rôle |
|-----------|-----------|------|
| **Frontend React** | Vercel | Site statique avec CDN global |
| **Backend FastAPI** | Render ou Railway | API REST avec base de données |
| **PostgreSQL** | Render/Railway | Base de données persistante |

### Avantages de cette architecture

✅ **Scalabilité indépendante** : Frontend et backend peuvent être scalés séparément
✅ **Performance optimale** : Frontend servi par le CDN Vercel
✅ **Backend continu** : Pas de limitations serverless (timeout, cold starts)
✅ **Coût réduit** : Plan gratuit généreux sur les deux plateformes
✅ **Flexibilité** : Facile de migrer le backend vers un autre provider

## 📝 License

MIT License - voir fichier LICENSE pour détails.

---

Construit avec ❤️ pour Vault API.
