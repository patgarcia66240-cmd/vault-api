# Guide de Déploiement - Vault API

Ce guide explique comment déployer votre application Vault API avec :
- **Backend** : Deployé sur Render
- **Frontend** : Deployé sur Vercel

## 📋 Prérequis

- Un compte [Render](https://render.com)
- Un compte [Vercel](https://vercel.com)
- Un compte [GitHub](https://github.com) (votre code doit être push sur GitHub)
- Un compte [Stripe](https://stripe.com) (pour les paiements)

---

## 🚀 Étape 1 : Déployer le Backend sur Render

### 1.1 Préparer le dépôt GitHub

Assurez-vous que votre code est push sur GitHub :

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte ou connectez-vous avec GitHub

### 1.3 Importer le projet sur Render

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre compte GitHub si ce n'est pas déjà fait
3. Sélectionnez votre dépôt `vault-api`
4. Remplissez les informations :

   - **Name**: `vault-api-server`
   - **Environment**: `Docker`
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Select **Free** ou **Starter**

### 1.4 Configurer les variables d'environnement

Dans la section **"Environment Variables"**, ajoutez :

| Clé | Valeur | Note |
|-----|--------|------|
| `ENVIRONMENT` | `production` | |
| `PORT` | `8000` | |
| `JWT_SECRET` | `[générer une clé secrète]` | Utilisez: `openssl rand -hex 32` |
| `CRYPTO_MASTER_KEY` | `[générer une clé secrète]` | Utilisez: `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | `sk_test_...` ou `sk_live_...` | Depuis votre dashboard Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Secret du webhook Stripe |
| `STRIPE_PRICE_PRO` | `price_...` | ID du prix Pro dans Stripe |
| `WEB_BASE_URL` | `https://votre-app.vercel.app` | URL de votre frontend Vercel |
| `ALLOWED_ORIGINS` | `https://votre-app.vercel.app` | URLs autorisées pour CORS |

**Note** : `DATABASE_URL` sera automatiquement configuré par Render (voir étape suivante).

### 1.5 Créer la base de données PostgreSQL

1. Allez sur **"New +"** → **"PostgreSQL"**
2. Configurez :

   - **Name**: `vault-api-db`
   - **Database**: `vault_api`
   - **User**: `vault_api_user`
   - **Plan**: Select **Free** ou **Starter**

3. Une fois créée, Render va automatiquement lier cette DB à votre service web via la configuration `render.yaml`

### 1.6 Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendre que le déploiement soit terminé (premier déploiement = ~5-10 minutes)
3. Render vous donnera une URL comme : `https://vault-api-server.onrender.com`

**Note importante** : Notez cette URL, vous en aurez besoin pour le frontend !

---

## 🎨 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Installer Vercel CLI (optionnel)

```bash
npm install -g vercel
```

### 2.2 Déployer via le Dashboard

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre dépôt GitHub
4. Sélectionnez le dossier `apps/web` (ou configurez le **Root Directory**)
5. Configurez les variables d'environnement :

   | Clé | Valeur |
   |-----|--------|
   | `VITE_API_URL` | `https://vault-api-server.onrender.com` |

6. Cliquez sur **"Deploy"**

### 2.3 Déployer via la CLI

Depuis le dossier `apps/web` :

```bash
cd apps/web
vercel
```

Suivez les instructions :
- Appuyez sur **Enter** pour utiliser les valeurs par défaut
- Entrez l'URL de votre API Render quand demandé pour `VITE_API_URL`

---

## ✅ Étape 3 : Configurer Stripe Webhooks

### 3.1 Créer un Webhook Stripe

1. Allez sur votre [Dashboard Stripe](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **"Add endpoint"**
3. Configurez :

   - **Endpoint URL**: `https://vault-api-server.onrender.com/api/billing/webhook`
   - **Events to listen to**: Sélectionnez :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. Cliquez sur **"Add endpoint"**
5. Copiez le **Signing Secret** (commence par `whsec_...`)

### 3.2 Ajouter le Secret sur Render

1. Allez sur votre service Render
2. Dans **"Environment"**
3. Ajoutez/Modifiez la variable `STRIPE_WEBHOOK_SECRET` avec le secret copié

---

## 🔧 Étape 4 : Mettre à jour les CORS

Dans votre configuration Render, mettez à jour `ALLOWED_ORIGINS` :

```
https://votre-app.vercel.app,https://vault-api-web.vercel.app
```

Si vous avez plusieurs environnements (dev, staging, prod), séparez-les par des virgules.

---

## 🧪 Étape 5 : Tester le déploiement

### 5.1 Tester le Backend

Visitez l'URL de votre API Render :
```
https://vault-api-server.onrender.com
```

Vous devriez voir :
```json
{
  "name": "Vault API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "apiKeys": "/api/apikeys",
    "docs": "/docs"
  }
}
```

### 5.2 Tester le Frontend

1. Allez sur votre URL Vercel
2. Essayez de créer un compte
3. Testez la connexion

---

## 📊 Monitoring

### Render
- Allez sur [dashboard.render.com](https://dashboard.render.com)
- Vérifiez les logs dans votre service
- Surveillez l'utilisation CPU/Mémoire

### Vercel
- Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
- Vérifiez les deployments
- Surveillez les performances

---

## 🐛 Dépannage

### Le backend est lent au démarrage
- **Normal** sur le plan gratuit Render (~5-10 min pour le premier démarrage)
- Le service se met en "sleep" après 15 minutes d'inactivité

### Erreurs CORS
- Vérifiez que `ALLOWED_ORIGINS` inclut votre URL Vercel
- Vérifiez que `WEB_BASE_URL` est correct

### Erreur de connexion à la DB
- Vérifiez que `DATABASE_URL` est bien lié à la DB Render
- Regardez les logs dans le dashboard Render

### Les webhooks Stripe ne fonctionnent pas
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifiez que l'URL du webhook est accessible publiquement
- Testez le webhook depuis le dashboard Stripe

---

## 🔄 Mise à jour du déploiement

### Backend
- Push sur GitHub → Render déploie automatiquement
- Pour forcer un redeploy : Cliquez **"Manual Deploy"** dans le dashboard Render

### Frontend
- Push sur GitHub → Vercel déploie automatiquement
- Ou : `vercel --prod` depuis le dossier `apps/web`

---

## 📝 Variables d'environnement complètes

### Backend (Render)
```bash
ENVIRONMENT=production
PORT=8000
DATABASE_URL=postgresql://...
JWT_SECRET=votre_clé_secrète_ici
CRYPTO_MASTER_KEY=votre_clé_secrète_ici
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
WEB_BASE_URL=https://votre-app.vercel.app
ALLOWED_ORIGINS=https://votre-app.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://vault-api-server.onrender.com
```

---

## 🎉 Félicitations !

Votre application Vault API est maintenant déployée :
- ✅ Backend sur Render
- ✅ Frontend sur Vercel
- ✅ Base de données PostgreSQL sur Render
- ✅ Webhooks Stripe configurés

Pour toute question, consultez la [documentation Render](https://render.com/docs) ou [Vercel](https://vercel.com/docs).
