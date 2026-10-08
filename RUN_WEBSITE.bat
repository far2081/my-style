@echo off
title STYLEMIRA AI - Luxury Haute Couture Platform
echo ===================================================================
echo             STYLEMIRA AI - LUXURY FASHION PLATFORM
echo ===================================================================
echo Starting website...
cd /d "%~dp0"
start "" "%~dp0standalone.html"
start http://localhost:5173
npm run dev
pause
