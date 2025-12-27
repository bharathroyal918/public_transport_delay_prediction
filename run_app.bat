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