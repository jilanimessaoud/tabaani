#!/bin/bash
# Setup script for Tabaani Application
# This script creates the .env file and copies the logo

echo "Setting up Tabaani Application..."

# Create .env file in server directory
ENV_FILE="server/.env"
if [ -f "$ENV_FILE" ]; then
    echo ".env file already exists. Skipping..."
else
    cat > "$ENV_FILE" << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tabani

# JWT Secret Key (Change this in production!)
JWT_SECRET=tabaaniculture&historique2025@tabani

# Server Port
PORT=5000

# Environment
NODE_ENV=development
EOF
    echo ".env file created successfully!"
fi

# Copy logo to client public folder
if [ -f "logo.jpeg" ]; then
    cp logo.jpeg client/public/logo.jpeg
    echo "Logo copied to client/public/ successfully!"
else
    echo "Warning: logo.jpeg not found in root directory!"
    echo "Please manually copy logo.jpeg to client/public/logo.jpeg"
fi

echo ""
echo "Setup complete!"
echo "Next steps:"
echo "1. Review and update server/.env with your MongoDB connection string"
echo "2. Change JWT_SECRET to a secure random string for production"
echo "3. Run 'npm run dev' to start the application"

