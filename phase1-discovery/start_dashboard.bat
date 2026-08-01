@echo off
echo Starting Phase 1 Discovery Dashboard...
echo.
echo [1/2] Next.js frontend on http://localhost:3000
start "Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul
echo [2/2] Streamlit shell on http://localhost:8501
cd /d %~dp0
streamlit run dashboard/app.py
