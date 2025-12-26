# Dockerfile pour Render et Railway
FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY apps/server-python/app ./app
COPY apps/server-python/alembic.ini ./
COPY apps/server-python/alembic ./alembic

# Créer un répertoire pour les logs
RUN mkdir -p /app/logs

# Exposer le port
EXPOSE 8000

# Commande de démarrage pour Render/Railway
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
