<#
.SYNOPSIS
  Oxpecker AI - One-Command Fullstack Deployment Script for Microsoft Azure
.DESCRIPTION
  This script packages and deploys both Frontend and Backend or triggers the GitHub CI/CD pipeline.
#>

param(
    [string]$Mode = "git" # Options: "git" (recommended, via GitHub Actions) or "direct" (via Azure CLI)
)

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Oxpecker AI — 1-Click Azure Deployment Pipeline     " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$CurrentBranch = (git branch --show-current).Trim()
Write-Host "[*] Active Git Branch: $CurrentBranch" -ForegroundColor Yellow

if ($Mode -eq "git") {
    Write-Host "[*] Triggering automated cloud deployment via GitHub Actions..." -ForegroundColor Green
    Write-Host "[*] Staging all pending changes..." -ForegroundColor Yellow
    git add .
    
    $Status = git status --porcelain
    if ($Status) {
        $CommitMsg = "deploy: automatic production build $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "[*] Committing changes: '$CommitMsg'" -ForegroundColor Yellow
        git commit -m $CommitMsg
    } else {
        Write-Host "[*] Working directory clean, nothing to commit." -ForegroundColor Green
    }

    Write-Host "[*] Pushing to GitHub (origin & fork)..." -ForegroundColor Yellow
    git push origin $CurrentBranch
    git push fork $CurrentBranch

    Write-Host "======================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Code pushed to GitHub." -ForegroundColor Green
    Write-Host " GitHub Actions (.github/workflows/azure-deploy.yml) is now automatically" -ForegroundColor Cyan
    Write-Host " deploying both Frontend (oxpecker-web) & Backend (oxpecker-api) to Azure!" -ForegroundColor Cyan
    Write-Host " Check progress live at: https://github.com/EquiSaaS-BD/Oxpecker-AI/actions" -ForegroundColor Yellow
    Write-Host " Live Custom URL: https://oxpecker.equisaas-bd.com" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
}
elseif ($Mode -eq "direct") {
    Write-Host "[*] Starting Direct Azure Web App Zip Deployment..." -ForegroundColor Yellow
    
    # Check Azure CLI
    az account show > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Azure CLI is not logged in. Run 'az login' first."
        exit 1
    }

    # Backend
    Write-Host "[*] Packaging Backend FastAPI..." -ForegroundColor Yellow
    Push-Location Backend
    if (Test-Path "../backend-deploy.zip") { Remove-Item "../backend-deploy.zip" -Force }
    Compress-Archive -Path * -DestinationPath "../backend-deploy.zip" -CompressionLevel Optimal
    Pop-Location

    Write-Host "[*] Deploying Backend to oxpecker-api..." -ForegroundColor Yellow
    az webapp deploy --resource-group rg-oxpecker-prod --name oxpecker-api --src-path ./backend-deploy.zip --type zip

    # Frontend
    Write-Host "[*] Building Next.js Standalone Frontend..." -ForegroundColor Yellow
    Push-Location Frontend
    npm run build
    Pop-Location

    Write-Host "======================================================" -ForegroundColor Green
    Write-Host " Direct deployment complete!" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
}
