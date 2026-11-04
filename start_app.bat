@echo off
echo Starting Geo Tracker Backend and Frontend...
start cmd /k "cd back_end && npm run dev"
start cmd /k "cd front_end && npm run dev"
timeout /t 3 /nobreak > nul
start http://localhost:5173