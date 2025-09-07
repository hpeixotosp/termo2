#!/bin/bash

# Deploy script for DigitalOcean Droplet
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to DigitalOcean..."

# Server configuration
SERVER_IP="143.110.196.243"
SERVER_USER="ubuntu"
SERVER_PATH="/home/ubuntu/termo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Preparing deployment files...${NC}"

# Create deployment package
tar -czf termo-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=*.log \
    --exclude=.env.local \
    .

echo -e "${YELLOW}📤 Uploading files to server...${NC}"

# Upload files to server
scp termo-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:~/
scp docker-compose.prod.yml ${SERVER_USER}@${SERVER_IP}:~/
scp env.production ${SERVER_USER}@${SERVER_IP}:~/

echo -e "${YELLOW}🔧 Setting up server...${NC}"

# Execute deployment on server
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker ubuntu
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Create project directory
    mkdir -p termo
    cd termo
    
    # Extract files
    tar -xzf ~/termo-deploy.tar.gz
    cp ~/docker-compose.prod.yml .
    cp ~/env.production .env
    
    # Set permissions
    chmod +x deploy.sh
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    docker-compose -f docker-compose.prod.yml ps
    
    echo "✅ Deployment completed!"
    echo "🌐 Frontend: http://143.110.196.243"
    echo "🔧 Backend API: http://143.110.196.243:3001"
    echo "💾 MySQL: localhost:3306"
EOF

# Clean up local files
rm termo-deploy.tar.gz

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is now running at: http://143.110.196.243${NC}"
echo -e "${GREEN}🔧 API endpoint: http://143.110.196.243:3001${NC}"
