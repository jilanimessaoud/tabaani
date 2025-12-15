# Setup script for Tabaani Application
# This script creates the .env file and copies the logo

Write-Host "Setting up Tabaani Application..." -ForegroundColor Green

# Create .env file in server directory
$envContent = @"
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tabani

# JWT Secret Key (Change this in production!)
JWT_SECRET=tabaaniculture&historique2025@tabani

# Server Port
PORT=5000

# Environment
NODE_ENV=development
"@

$envPath = "server\.env"
if (Test-Path $envPath) {
    Write-Host ".env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Set-Content -Path $envPath -Value $envContent
    Write-Host ".env file created successfully!" -ForegroundColor Green
}

# Copy logo to client public folder
$logoSource = "logo.jpeg"
$logoDest = "client\public\logo.jpeg"

if (Test-Path $logoSource) {
    Copy-Item -Path $logoSource -Destination $logoDest -Force
    Write-Host "Logo copied to client/public/ successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: logo.jpeg not found in root directory!" -ForegroundColor Yellow
    Write-Host "Please manually copy logo.jpeg to client/public/logo.jpeg" -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review and update server/.env with your MongoDB connection string" -ForegroundColor White
Write-Host "2. Change JWT_SECRET to a secure random string for production" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the application" -ForegroundColor White

