@echo off
REM ============================================
REM Vault API - Redémarrage du serveur Backend
REM ============================================

echo.
echo ========================================
echo   Arrêt des processus Python...
echo ========================================
echo.

REM Arrêter tous les processus Python (backend)
taskkill /F /IM python.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Processus Python arrêtés
) else (
    echo [INFO] Aucun processus Python trouvé
)

echo.
echo ========================================
echo   Démarrage du serveur Backend...
echo ========================================
echo.

cd apps\server-python
start.bat
