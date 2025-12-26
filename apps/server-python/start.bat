@echo off
REM ============================================
REM Vault API - FastAPI Server Launcher
REM ============================================

echo.
echo ========================================
echo   Vault API - FastAPI Server
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installé ou pas dans le PATH
    echo Veuillez installer Python 3.9+ depuis https://python.org
    pause
    exit /b 1
)

REM Vérifier si l'environnement virtuel existe
if not exist "venv" (
    echo [INFO] Environnement virtuel non trouvé, création en cours...
    python -m venv venv
    if errorlevel 1 (
        echo [ERREUR] Impossible de créer l'environnement virtuel
        pause
        exit /b 1
    )
    echo [OK] Environnement virtuel créé
    echo.
)

REM Activer l'environnement virtuel
echo [INFO] Activation de l'environnement virtuel...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERREUR] Impossible d'activer l'environnement virtuel
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
echo [INFO] Vérification des dépendances...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installation des dépendances...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERREUR] Impossible d'installer les dépendances
        pause
        exit /b 1
    )
    echo [OK] Dépendances installées
) else (
    echo [OK] Dépendances déjà installées
)
echo.

REM Vérifier si le fichier .env existe
if not exist ".env" (
    echo [ATTENTION] Fichier .env non trouvé
    echo Copie de .env.example vers .env...
    copy .env.example .env >nul
    echo [ATTENTION] Veuillez éditer le fichier .env avec vos configurations
    echo.
    pause
)

REM Configurer PYTHONPATH
set PYTHONPATH=%CD%;%PYTHONPATH%

REM Lancer le serveur
echo ========================================
echo   Démarrage du serveur FastAPI
echo ========================================
echo.
echo Serveur: http://localhost:8000
echo Documentation: http://localhost:8000/docs
echo API: http://localhost:8000/api
echo.
echo Appuyez sur Ctrl+C pour arrêter
echo ========================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
