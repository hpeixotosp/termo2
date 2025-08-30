#!/bin/bash

# Script de deploy para o servidor DigitalOcean
# IP: 143.110.196.243

echo "🚀 Iniciando deploy do Termo2 Backend..."

# Configurações
SERVER_IP="143.110.196.243"
SERVER_USER="root"
APP_DIR="/opt/termo2-backend"
DOCKER_IMAGE="termo2-backend:latest"

# 1. Build da imagem Docker
echo "📦 Construindo imagem Docker..."
docker build -t $DOCKER_IMAGE .

# 2. Salvar imagem como tar
echo "💾 Salvando imagem..."
docker save $DOCKER_IMAGE | gzip > termo2-backend.tar.gz

# 3. Transferir para o servidor
echo "📤 Transferindo para o servidor..."
scp termo2-backend.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# 4. Executar comandos no servidor
echo "🔧 Configurando servidor..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    # Criar diretório da aplicação
    mkdir -p /opt/termo2-backend
    
    # Parar container existente
    docker stop termo2-backend || true
    docker rm termo2-backend || true
    
    # Carregar nova imagem
    docker load < /tmp/termo2-backend.tar.gz
    
    # Executar novo container
    docker run -d \
        --name termo2-backend \
        --restart unless-stopped \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e PORT=3000 \
        -e FRONTEND_URL=https://termo2-frontend-*.ondigitalocean.app \
        termo2-backend:latest
    
    # Limpar arquivo temporário
    rm /tmp/termo2-backend.tar.gz
    
    # Verificar status
    docker ps | grep termo2-backend
    echo "✅ Deploy concluído!"
EOF

# 5. Limpar arquivo local
rm termo2-backend.tar.gz

echo "🎉 Deploy concluído com sucesso!"
echo "🌐 Backend disponível em: http://$SERVER_IP:3000"
echo "📊 Health check: http://$SERVER_IP:3000/health"
