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

### Backend (apps/server)
- **Fastify** (Node.js) + **TypeScript**
- **Prisma** ORM avec **SQLite**
- **JWT** pour l'authentification
- **AES-256-GCM** pour le chiffrement
- **Stripe** pour les paiements
- **Zod** pour la validation
- **Pino** pour les logs

## 📁 Structure du Projet

```
vault-api/
├─ apps/
│  ├─ server/           # Backend Fastify
│  │  ├─ src/
│  │  │  ├─ libs/       # JWT, crypto, utils
│  │  │  ├─ services/   # Logique métier
│  │  │  ├─ routes/     # Endpoints API
│  │  │  └─ schemas/    # Validation Zod
│  │  └─ prisma/        # Schéma de base de données
│  └─ web/              # Frontend React
│     ├─ src/
│     │  ├─ components/ # Composants UI
│     │  ├─ pages/      # Pages React
│     │  └─ lib/        # Services & API client
├─ debug-server.js      # Script de débogage
├─ package.json         # Configuration workspace
└─ README.md
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- pnpm 8+

### Installation

1. **Cloner et installer les dépendances**
```bash
git clone <repository>
cd vault-api
pnpm install
```

2. **Configurer les variables d'environnement**

Backend (apps/server/.env):
```bash
cp apps/server/.env.example apps/server/.env
# Éditer apps/server/.env avec vos valeurs
```

Frontend (apps/web/.env):
```bash
cp apps/web/.env.example apps/web/.env
```

3. **Initialiser la base de données**
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

4. **Démarrer les serveurs de développement**
```bash
# Démarrer frontend et backend
pnpm dev

# Ou individuellement
pnpm dev:server  # Backend sur :8080
pnpm dev:web     # Frontend sur :5173
```

## 🔐 Variables d'Environnement

### Backend (.env)
```bash
NODE_ENV=development
PORT=8080
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_at_least_32_characters"
CRYPTO_MASTER_KEY="base64_encoded_32_byte_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PRICE_PRO="price_your_pro_plan"
WEB_BASE_URL="http://localhost:5173"
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
```

## 📊 Endpoints API

### Authentification
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

### Clés API
- `GET /api/keys` - Lister les clés API
- `POST /api/keys` - Créer une nouvelle clé API
- `DELETE /api/keys/:id` - Révoquer une clé API

### Facturation
- `POST /api/billing/checkout` - Créer une session Stripe
- `POST /api/billing/webhook` - Gérer les webhooks Stripe

## 🎨 Système de Design

L'application utilise un design glassmorphism moderne avec :
- **Couleurs** : Noir (#0a0a0a) + Jaune (#FFD400)
- **Typographie** : Police Inter
- **Composants** : Cartes et boutons glassmorphism
- **Animations** : Transitions fluides

## 🛠️ Développement

### Scripts Disponibles

```bash
# Développement
pnpm dev              # Démarrer les deux serveurs
pnpm dev:server       # Backend uniquement
pnpm dev:web          # Frontend uniquement

# Base de données
pnpm prisma:generate  # Générer client Prisma
pnpm prisma:migrate   # Lancer les migrations
pnpm prisma:studio    # Ouvrir Prisma Studio

# Build
pnpm build            # Build des deux apps
pnpm build:server     # Backend uniquement
pnpm build:web        # Frontend uniquement
```

### Débogage

Pour déboguer le backend :
- **Script** : `node debug-server.js`
- **VS Code** : Utiliser la configuration "Déboguer le Backend Server"

## 📝 License

MIT License - voir fichier LICENSE pour détails.

---

Construit avec ❤️ pour Vault API.
