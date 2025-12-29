# Architecture du Serveur Vault API

## 📁 Structure du Projet

```
app/
├── main.py                    # Point d'entrée FastAPI
├── core/                      # Configuration et utilitaires
│   ├── config.py              # Configuration centralisée
│   ├── database.py            # Connexion BDD
│   └── security.py            # Hashage mot de passe, JWT, chiffrement
├── models/                    # Modèles SQLAlchemy (BDD)
│   ├── user.py                # Modèle User
│   ├── apikey.py              # Modèle ApiKey
│   └── invoice.py             # Modèle Invoice
├── schemas/                   # Schémas Pydantic (validation)
│   └── user.py                # Schémas User (Create, Login, Response)
├── repositories/              # Couche d'accès aux données (CRUD)
│   └── user_repo.py           # Repository User
├── services/                  # Logique métier
│   └── auth_service.py        # Service d'authentification
└── routes/                    # Routes API FastAPI
    ├── auth.py                # Routes d'authentification
    └── apikeys.py             # Routes pour les API keys
```

## 🏗️ Architecture en Couches

### 1. **Routes** (`routes/`)
- **Rôle**: Points d'entrée HTTP
- **Responsabilité**: Validation de base, appel des services
- **Ne contient pas**: Logique métier

### 2. **Services** (`services/`)
- **Rôle**: Logique métier
- **Responsabilité**: Orchestration des repositories, validation métier
- **Exemple**: AuthService gère signup, signin, password reset

### 3. **Repositories** (`repositories/`)
- **Rôle**: Accès aux données (CRUD)
- **Responsabilité**: Opérations de base de données pures
- **Avantage**: Facile à tester, réutilisable

## 🔄 Flux de Requête

```
Request → Route → Service → Repository → Database
                ↓         ↓           ↓
           Validation  Logique   SQL Queries
```

### Exemple: Inscription

```python
# Route (auth.py)
@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    token, user = auth_service.signup(db, user_data.email, user_data.password)
    return user

# Service (auth_service.py)
def signup(self, db, email, password):
    if self.user_repo.email_exists(db, email):
        raise ValueError("Email exists")
    user = User(email=email, password_hash=hash_password(password))
    return self.user_repo.create(db, user)

# Repository (user_repo.py)
def email_exists(self, db, email):
    return db.query(User).filter(User.email == email).first() is not None
```

## 🔐 Fonctionnalités d'Authentification

### Routes Disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/recover` | Demander récupération mot de passe |
| POST | `/api/auth/reset` | Réinitialiser mot de passe |
| GET | `/api/auth/me` | Infos utilisateur (authentifié) |

### Sécurité

- ✅ **Hashage bcrypt** pour les mots de passe
- ✅ **Tokens JWT** pour l'authentification
- ✅ **Tokens de reset** avec expiration (15 min)
- ✅ **Tokens d'accès** avec expiration (30 jours)

## 🚀 Lancement du Serveur

```bash
# Développement
cd apps/server-python
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ou avec le script
start.bat
```

## 🧪 Tester l'API

```bash
# Lancer les tests
python test_api.py

# Documentation interactive
# Ouvrir http://localhost:8000/docs
```

## 📊 Base de Données

### Tables

- **`auth.user`** - Utilisateurs
- **`auth.api_keys`** - Clés API
- **`auth.invoices`** - Factures

### Schéma

```
auth.user
├── id (UUID, PK)
├── email (VARCHAR, unique)
├── password (VARCHAR)
├── name (VARCHAR)
├── role (VARCHAR)
├── emailVerified (BOOLEAN)
├── plan (VARCHAR: FREE/PRO)
└── timestamps (createdAt, updatedAt)
```

## 🔧 Configuration

Variables d'environnement dans `.env`:

```env
# Base de données Supabase
DATABASE_URL=postgresql+pg8000://...

# JWT
JWT_SECRET=votre_secret_key
JWT_EXPIRATION_MINUTES=43200  # 30 jours
JWT_RESET_TOKEN_MINUTES=15

# Chiffrement AES-256
CRYPTO_MASTER_KEY=base64_encoded_32_bytes

# Stripe
STRIPE_SECRET_KEY=sk_test_...
```

## 📦 Dépendances

- **FastAPI** - Framework API
- **SQLAlchemy** - ORM
- **Pydantic** - Validation
- **python-jose** - JWT
- **passlib** - Hashage
- **pg8000** - Driver PostgreSQL
- **cryptography** - Chiffrement AES

## 🎯 Prochaines Étapes

- [ ] Envoi d'emails réels (SMTP/SendGrid)
- [ ] Refresh tokens
- [ ] Rôles et permissions
- [ ] Rate limiting
- [ ] Tests unitaires
- [ ] Dockerisation
