@echo off
cd /d "%~dp0"
echo Installing base dependencies...
call npm install
echo Installing additional libraries...
call npm install recharts axios lucide-react leaflet react-leaflet
echo Done.
pause
