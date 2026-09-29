#!/bin/bash
# One-click Server Deployment Script for 75.119.137.160

SERVER_IP="75.119.137.160"
REPO_URL="https://github.com/Dean142A/keepsake-smith.git"

echo "=========================================="
echo " Deploying Keepsake Smith to $SERVER_IP "
echo "=========================================="

echo "--> Pushing latest code to GitHub..."
git add .
git commit -m "Build: Complete Keepsake storefront, portal, custom flow & API"
git push -u origin main

echo "--> Commands to execute on server root@$SERVER_IP:"
echo ""
echo "  1. ssh root@$SERVER_IP"
echo "  2. git clone $REPO_URL /var/www/keepsake || (cd /var/www/keepsake && git pull)"
echo "  3. cd /var/www/keepsake && docker-compose up --build -d"
echo ""
echo "Deployment setup complete!"
