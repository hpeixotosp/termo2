# 🚀 Deploy do Termo para DigitalOcean

Este guia explica como fazer o deploy completo do jogo Termo para o DigitalOcean Droplet.

## 📋 Pré-requisitos

- Conta no DigitalOcean
- Droplet com Ubuntu 20.04+ configurado
- Acesso SSH ao servidor
- Docker e Docker Compose instalados

## 🔧 Configuração do Servidor

### 1. Conectar ao servidor
```bash
ssh ubuntu@143.110.196.243
```

### 2. Instalar Docker e Docker Compose
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout e login novamente para aplicar as permissões
exit
ssh ubuntu@143.110.196.243
```

## 🚀 Deploy Automático

### Opção 1: Deploy via script (Recomendado)
```bash
# No seu computador local
./deploy.sh
```

### Opção 2: Deploy manual
```bash
# 1. Fazer upload dos arquivos
scp -r . ubuntu@143.110.196.243:~/termo/

# 2. Conectar ao servidor
ssh ubuntu@143.110.196.243

# 3. Navegar para o diretório
cd termo

# 4. Configurar variáveis de ambiente
cp env.production .env

# 5. Iniciar os serviços
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🌐 Acessos

Após o deploy, o jogo estará disponível em:

- **Frontend**: http://143.110.196.243
- **Backend API**: http://143.110.196.243:3001
- **MySQL**: localhost:3306 (apenas no servidor)

## 🔧 Gerenciamento dos Serviços

### Verificar status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Ver logs
```bash
# Todos os serviços
docker-compose -f docker-compose.prod.yml logs

# Serviço específico
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs mysql
```

### Parar serviços
```bash
docker-compose -f docker-compose.prod.yml down
```

### Reiniciar serviços
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Atualizar aplicação
```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Fazer pull das mudanças
git pull origin main

# Rebuild e iniciar
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🗄️ Banco de Dados

### Acessar MySQL
```bash
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
```

### Backup do banco
```bash
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p termo_game > backup.sql
```

### Restaurar backup
```bash
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p termo_game < backup.sql
```

## 🔒 Configurações de Segurança

### 1. Configurar firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Configurar SSL (opcional)
```bash
# Instalar Certbot
sudo apt install certbot

# Gerar certificado
sudo certbot certonly --standalone -d 143.110.196.243
```

## 📊 Monitoramento

### Verificar uso de recursos
```bash
docker stats
```

### Verificar logs do sistema
```bash
sudo journalctl -u docker
```

## 🆘 Troubleshooting

### Problema: Serviços não iniciam
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs

# Verificar se as portas estão livres
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3001
```

### Problema: Banco de dados não conecta
```bash
# Verificar se o MySQL está rodando
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Verificar logs do MySQL
docker-compose -f docker-compose.prod.yml logs mysql
```

### Problema: Frontend não carrega
```bash
# Verificar se o Next.js está rodando
docker-compose -f docker-compose.prod.yml logs frontend

# Verificar se o Nginx está rodando
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🔄 Atualizações

Para atualizar o jogo:

1. **Fazer as mudanças** no código local
2. **Commitar as mudanças**:
   ```bash
   git add .
   git commit -m "Update: descrição das mudanças"
   git push origin main
   ```
3. **Executar o deploy**:
   ```bash
   ./deploy.sh
   ```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs dos serviços
2. Verifique se todas as portas estão abertas
3. Verifique se o Docker está rodando
4. Verifique as configurações de rede

---

**🎉 Pronto! Seu jogo Termo está rodando no DigitalOcean!**