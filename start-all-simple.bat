@echo off
REM ============================================
REM Vault API - Demarrage complet (Backend + Frontend)
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Vault API - Demarrage Complet
echo ========================================
echo.

REM Verifier si pnpm est installe
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] pnpm n'est pas installe, installation en cours...
    call npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Impossible d'installer pnpm
        echo Veuillez installer pnpm manuellement: npm install -g pnpm
        pause
        exit /b 1
    )
    echo [OK] pnpm installe avec succes!
    echo.
)

REM Verifier si le fichier .env existe
if not exist ".env" (
    echo [ATTENTION] Fichier .env non trouve a la racine du projet
    echo            Creation du fichier .env avec les valeurs par defaut...
    echo.
    echo ENVIRONMENT=development> .env
    echo PORT=8000>> .env
    echo DATABASE_URL=postgresql://postgres:Laviesestbelle@db.kxqigfvgfbhpvueght.supabase.co/supabase?sslmode=require>> .env
    echo JWT_SECRET=development_secret_key_at_least_32_characters_long_for_testing>> .env
    echo JWT_ALGORITHM=HS256>> .env
    echo CRYPTO_MASTER_KEY=SGVsbG9Xb3JsZENyeXB0b2dyYXBoWWVhSFR0ZXN0S2V5MTIz>> .env
    echo STRIPE_SECRET_KEY=sk_test_placeholder>> .env
    echo STRIPE_WEBHOOK_SECRET=whsec_placeholder>> .env
    echo STRIPE_PRICE_PRO=price_placeholder>> .env
    echo WEB_BASE_URL=http://localhost:5173>> .env
    echo ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174>> .env
    echo [OK] Fichier .env cree!
    echo.
)

REM Verifier si les dependances sont installees
echo [INFO] Verification des dependances...
if not exist "node_modules" (
    echo [INFO] Installation des dependances (pnpm install)...
    echo Cela peut prendre quelques minutes...
    echo.
    call pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Impossible d'installer les dependances
        echo.
        echo Tentative avec npm a la place...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo [ERREUR] Impossible d'installer les dependances avec pnpm ou npm
            echo.
            echo Solutions possibles:
            echo   1. Verifiez votre connexion internet
            echo   2. Essayez: npm install --legacy-peer-deps
            echo   3. Supprimez le dossier node_modules et reessayez
            pause
            exit /b 1
        )
    )
    echo [OK] Dependances installees!
    echo.
) else (
    echo [OK] Dependances deja installees
    echo.
)

echo ========================================
echo   Serveurs disponibles:
echo     Frontend: http://localhost:5173
echo     Backend:  http://localhost:8000
echo     API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Appuyez sur Ctrl+C pour arreter les deux serveurs
echo.

REM Lancer les deux serveurs en parallele
echo [INFO] Demarrage du Backend (FastAPI)...
cd apps\server-python
start "Vault API Backend" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

cd ..\..
timeout /t 3 /nobreak >nul

echo [INFO] Demarrage du Frontend (Vite)...
start "Vault API Frontend" cmd /k "pnpm --filter web dev"

echo.
echo [OK] Les deux serveurs sont en cours d'execution!
echo.
echo ========================================
echo   Deux fenetres se sont ouvertes:
echo     - Une pour le Backend (Python/FastAPI)
echo     - Une pour le Frontend (Node/Vite)
echo ========================================
echo.
echo Pour arreter les serveurs, fermez simplement les deux fenetres.
echo.
pause
