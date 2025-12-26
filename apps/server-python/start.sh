#!/bin/bash

# ============================================
# Vault API - FastAPI Server Launcher
# ============================================

echo ""
echo "========================================"
echo "  Vault API - FastAPI Server"
echo "========================================"
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "[ERREUR] Python n'est pas installé"
    echo "Veuillez installer Python 3.9+ depuis https://python.org"
    exit 1
fi

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    echo "[INFO] Environnement virtuel non trouvé, création en cours..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Impossible de créer l'environnement virtuel"
        exit 1
    fi
    echo "[OK] Environnement virtuel créé"
    echo ""
fi

# Activer l'environnement virtuel
echo "[INFO] Activation de l'environnement virtuel..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[ERREUR] Impossible d'activer l'environnement virtuel"
    exit 1
fi

# Vérifier si les dépendances sont installées
echo "[INFO] Vérification des dépendances..."
pip show fastapi &> /dev/null
if [ $? -ne 0 ]; then
    echo "[INFO] Installation des dépendances..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Impossible d'installer les dépendances"
        exit 1
    fi
    echo "[OK] Dépendances installées"
else
    echo "[OK] Dépendances déjà installées"
fi
echo ""

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "[ATTENTION] Fichier .env non trouvé"
    echo "Copie de .env.example vers .env..."
    cp .env.example .env
    echo "[ATTENTION] Veuillez éditer le fichier .env avec vos configurations"
    echo ""
    read -p "Appuyez sur Entrée après avoir configuré .env..."
fi

# Configurer PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Lancer le serveur
echo "========================================"
echo "  Démarrage du serveur FastAPI"
echo "========================================"
echo ""
echo "Serveur: http://localhost:8000"
echo "Documentation: http://localhost:8000/docs"
echo "API: http://localhost:8000/api"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo "========================================"
echo ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
