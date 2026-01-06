@echo off
set PROJECT_DIR=%~dp0
echo Setting up backend virtual environment...
cd "%PROJECT_DIR%backend"
if not exist venv (
    python -m venv venv
) else (
    echo Virtual environment already exists, skipping creation.
)
call venv\Scripts\activate.bat

REM Check for OpenRouteService API key
if "%ORS_API_KEY%"=="" (
    echo WARNING: ORS_API_KEY environment variable is not set!
    echo Please set your OpenRouteService API key to enable route visualization.
    echo You can get a free API key at: https://openrouteservice.org/
    echo.
    echo To set the API key, run:
    echo set ORS_API_KEY=your_api_key_here
    echo.
    echo Or set it permanently with:
    echo setx ORS_API_KEY "your_api_key_here"
    echo.
    echo Press any key to continue without API key, or Ctrl+C to cancel...
    pause > nul
) else (
    echo OpenRouteService API key found: %ORS_API_KEY:~0,10%...
)

echo Installing backend dependencies...
pip install -r requirements.txt
echo Starting backend...
start cmd /k "cd /d "%PROJECT_DIR%backend" && call venv\Scripts\activate.bat && python app.py"
timeout /t 5 /nobreak > nul
echo Installing frontend dependencies...
cd "%PROJECT_DIR%frontend"
if not exist node_modules (
    npm install
) else (
    echo Frontend dependencies already installed, skipping npm install.
)
echo Starting frontend...
start cmd /k "cd /d "%PROJECT_DIR%frontend" && npm run dev"
echo Both services started.