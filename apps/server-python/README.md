# Vault API - FastAPI Server

## Installation

```bash
# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

## Configuration

Copier `.env.example` vers `.env` et configurer les variables d'environnement :

```bash
cp .env.example .env
```

## Lancer le serveur

```bash
# Depuis la racine du projet (apps/server-python/)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Ou utiliser le script de démarrage :

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh && ./start.sh
```

## Endpoints

- `GET /` - Informations sur l'API
- `GET /health` - Health check
- `GET /docs` - Documentation Swagger
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur actuel
- `POST /api/apikeys` - Créer une API key
- `GET /api/apikeys` - Lister les API keys
- `DELETE /api/apikeys/{id}` - Révoquer une API key
