@echo off
REM ============================================
REM Vault API - Démarrage complet (Backend + Frontend)
REM ============================================

echo.
echo ========================================
echo   Vault API - Démarrage Complet
echo ========================================
echo.

REM Vérifier si pnpm est installé
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] pnpm n'est pas installé
    echo Installation en cours...
    npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Impossible d'installer pnpm
        echo Veuillez installer pnpm manuellement: npm install -g pnpm
        pause
        exit /b 1
    )
)

echo [INFO] Démarrage du serveur FastAPI (Backend)...
echo [INFO] Démarrage du serveur Vite (Frontend)...
echo.
echo ========================================
echo   Serveurs disponibles:
echo     Frontend: http://localhost:5173
echo     Backend:  http://localhost:8000
echo     API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Appuyez sur Ctrl+C pour arrêter les deux serveurs
echo.

REM Lancer les deux serveurs en parallèle
start /B pnpm dev:server
start /B pnpm dev:web

REM Attendre que l'utilisateur appuie sur une touche
pause

REM Arrêter les processus en arrière-plan
taskkill /F /IM node.exe >nul 2>nul
taskkill /F /IM python.exe >nul 2>nul
