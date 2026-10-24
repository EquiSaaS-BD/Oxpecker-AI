@echo off
REM Oxpecker AI - 1-Click Azure Deployment Batch File
title Oxpecker AI - Azure Deployment
echo ======================================================
echo    Oxpecker AI - 1-Click Azure Deployment
echo ======================================================
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause
