# Oxpecker AI - 1-Click Azure Deployment Script
param(
    [string]$Mode = "git"
)

# Automatically switch to the repository directory where this script lives
Set-Location -Path $PSScriptRoot

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Oxpecker AI - 1-Click Azure Deployment Pipeline    " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$CurrentBranch = (git branch --show-current).Trim()
Write-Host "[+] Active Git Branch: $CurrentBranch" -ForegroundColor Yellow

if ($Mode -eq "git") {
    Write-Host "[+] Staging all changes..." -ForegroundColor Yellow
    git add .
    
    $Status = git status --porcelain
    if ($Status) {
        $CommitMsg = "feat(deploy): automatic update " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Write-Host "[+] Committing: $CommitMsg" -ForegroundColor Yellow
        git commit -m $CommitMsg
    } else {
        Write-Host "[+] Working tree clean, pushing existing commits." -ForegroundColor Green
    }

    Write-Host "[+] Pushing to origin and fork ($CurrentBranch)..." -ForegroundColor Yellow
    git push origin $CurrentBranch
    git push fork $CurrentBranch

    Write-Host "======================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Code pushed to GitHub!" -ForegroundColor Green
    Write-Host " GitHub Actions (.github/workflows/azure-deploy.yml) is" -ForegroundColor Cyan
    Write-Host " automatically deploying Fullstack to Microsoft Azure!" -ForegroundColor Cyan
    Write-Host " Live Site: https://oxpecker.equisaas-bd.com" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
}
elseif ($Mode -eq "direct") {
    Write-Host "[+] Deploying Backend..." -ForegroundColor Yellow
    Push-Location Backend
    if (Test-Path "../backend-deploy.zip") { Remove-Item "../backend-deploy.zip" -Force }
    Compress-Archive -Path * -DestinationPath "../backend-deploy.zip" -CompressionLevel Optimal
    Pop-Location
    az webapp deploy --resource-group rg-oxpecker-prod --name oxpecker-api --src-path ./backend-deploy.zip --type zip

    Write-Host "[+] Direct deployment finished." -ForegroundColor Green
}
