@echo off
REM Adoras Backend Deployment Script for Windows
REM This script automates the deployment of the Supabase Edge Function

setlocal EnableDelayedExpansion

set PROJECT_REF=cyaaksjydpegofrldxbo
set FUNCTION_NAME=make-server-deded1eb
set HEALTH_URL=https://%PROJECT_REF%.supabase.co/functions/v1/%FUNCTION_NAME%/health

echo.
echo ========================================
echo    Adoras Backend Deployment Script
echo ========================================
echo.

REM Check if Supabase CLI is installed
echo [INFO] Checking for Supabase CLI...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Supabase CLI is not installed
    echo.
    echo Please install the Supabase CLI:
    echo   npm install -g supabase
    echo.
    echo Visit: https://supabase.com/docs/guides/cli/getting-started
    exit /b 1
)

echo [SUCCESS] Supabase CLI is installed
echo.

REM Check if user is logged in
echo [INFO] Checking authentication...
supabase projects list >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Not logged in to Supabase
    echo [INFO] Opening browser for authentication...
    echo.
    
    supabase login
    if %errorlevel% neq 0 (
        echo [ERROR] Authentication failed
        exit /b 1
    )
    
    echo [SUCCESS] Successfully authenticated
) else (
    echo [SUCCESS] Already authenticated
)
echo.

REM Link to project
echo [INFO] Linking to project: %PROJECT_REF%...
supabase link --project-ref %PROJECT_REF% >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Project may already be linked
)
echo [SUCCESS] Project linked
echo.

REM Check if function directory exists
if not exist "supabase\functions\server" (
    echo [ERROR] Function directory not found: supabase\functions\server
    echo [ERROR] Please run this script from the project root directory
    exit /b 1
)

REM Deploy the function
echo [INFO] Deploying Edge Function: %FUNCTION_NAME%
echo [INFO] This may take 30-60 seconds...
echo.

supabase functions deploy %FUNCTION_NAME% --project-ref %PROJECT_REF%
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed
    echo.
    echo Troubleshooting steps:
    echo 1. Check the logs: supabase functions logs %FUNCTION_NAME% --project-ref %PROJECT_REF%
    echo 2. Verify your project ID is correct: %PROJECT_REF%
    echo 3. Check the Supabase dashboard: https://supabase.com/dashboard
    exit /b 1
)

echo [SUCCESS] Edge Function deployed successfully!
echo.

echo [INFO] Waiting 5 seconds for function to warm up...
timeout /t 5 /nobreak >nul

REM Test the health endpoint
echo [INFO] Testing health endpoint...
curl -s -o nul -w "%%{http_code}" %HEALTH_URL% > http_code.tmp
set /p HTTP_CODE=<http_code.tmp
del http_code.tmp

if "%HTTP_CODE%"=="200" (
    echo [SUCCESS] Health check passed! Server is online
    echo.
    echo Server Response:
    curl -s %HEALTH_URL%
) else (
    echo [ERROR] Health check failed (HTTP %HTTP_CODE%^)
    echo [WARNING] The function may need a few more seconds to start
    echo.
    echo Try testing manually:
    echo   curl %HEALTH_URL%
)

echo.
echo ========================================
echo          Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Refresh your Adoras app
echo 2. The server status should show: Server Online
echo 3. Try signing up or logging in
echo.
echo Useful commands:
echo   View logs:    supabase functions logs %FUNCTION_NAME% --project-ref %PROJECT_REF% --follow
echo   Test health:  curl %HEALTH_URL%
echo   Dashboard:    https://supabase.com/dashboard
echo.

endlocal
