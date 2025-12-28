#!/bin/bash

# ============================================
# Vault API - Démarrage complet (Backend + Frontend)
# ============================================

echo ""
echo "========================================"
echo "  Vault API - Démarrage Complet"
echo "========================================"
echo ""

# Vérifier si pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "[ERREUR] pnpm n'est pas installé"
    echo "Installation en cours..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Impossible d'installer pnpm"
        echo "Veuillez installer pnpm manuellement: npm install -g pnpm"
        exit 1
    fi
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installation des dépendances..."
    pnpm install
    if [ $? -ne 0 ]; then
        echo "[ERREUR] Impossible d'installer les dépendances"
        exit 1
    fi
fi

echo "[INFO] Démarrage du serveur FastAPI (Backend)..."
echo "[INFO] Démarrage du serveur Vite (Frontend)..."
echo ""
echo "========================================"
echo "  Serveurs disponibles:"
echo "    Frontend: http://localhost:5173"
echo "    Backend:  http://localhost:8000"
echo "    API Docs: http://localhost:8000/docs"
echo "========================================"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les deux serveurs"
echo ""

# Lancer les deux serveurs avec concurrently
pnpm dev
