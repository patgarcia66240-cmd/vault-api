# 🚀 Scripts de Démarrage Rapide

Ce fichier explique comment démarrer rapidement l'application Vault API en mode développement.

## Méthodes de démarrage

### Option 1 : Script rapide (Recommandé)

**Windows :**
```bash
# Double-cliquez sur le fichier ou exécutez:
start-all.bat
```

**Linux/Mac :**
```bash
# Exécutez:
bash start-all.sh
# OU rendez-le exécutable:
chmod +x start-all.sh
./start-all.sh
```

**Avec pnpm :**
```bash
# Windows
pnpm start:windows

# Linux/Mac
pnpm start:unix
```

### Option 2 : Commande pnpm

```bash
# Démarrer le backend et le frontend
pnpm start

# OU
pnpm dev
```

### Option 3 : Démarrage séparé

**Démarrer uniquement le backend :**
```bash
# Windows
pnpm dev:server

# Linux/Mac
pnpm dev:server:unix
```

**Démarrer uniquement le frontend :**
```bash
pnpm dev:web
```

## URLs de développement

Une fois démarré, vous aurez accès à :

- **Frontend React** : http://localhost:5173
- **Backend FastAPI** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **API Endpoint** : http://localhost:8000/api

## Arrêter les serveurs

Appuyez sur `Ctrl+C` dans le terminal où les serveurs sont lancés.

## Scripts disponibles dans package.json

| Commande | Description |
|----------|-------------|
| `pnpm start` | Démarre backend + frontend (Linux/Mac) |
| `pnpm dev` | Démarre backend + frontend (Linux/Mac) |
| `pnpm start:windows` | Démarre avec start-all.bat (Windows) |
| `pnpm start:unix` | Démarre avec start-all.sh (Linux/Mac) |
| `pnpm dev:server` | Démarre seulement le backend (Windows) |
| `pnpm dev:server:unix` | Démarre seulement le backend (Linux/Mac) |
| `pnpm dev:web` | Démarre seulement le frontend |
| `pnpm build` | Build le frontend pour production |

## Configuration locale

Avant de démarrer, assurez-vous d'avoir configuré les fichiers `.env` :

**Backend (apps/server-python/.env)** :
```bash
cp apps/server-python/.env.example apps/server-python/.env
# Éditez le fichier avec vos configurations
```

**Frontend (apps/web/.env)** :
```bash
cp apps/web/.env.example apps/web/.env
# Éditez le fichier avec VITE_API_URL=http://localhost:8000
```

## Dépannage

### Python non trouvé
- Installez Python 3.9+ depuis https://python.org
- Sur Windows, cochez "Add Python to PATH" lors de l'installation

### pnpm non trouvé
```bash
npm install -g pnpm
```

### Dependencies manquantes
```bash
# Installer toutes les dépendances
pnpm install
```

### Port déjà utilisé
Si le port 8000 ou 5173 est déjà utilisé, vous pouvez changer les ports dans :
- Backend : `apps/server-python/start.sh` ou `start.bat`
- Frontend : `apps/web/vite.config.js`
