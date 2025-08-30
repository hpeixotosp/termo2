# 🚀 Termo2 - Deploy na DigitalOcean

Este documento descreve como migrar e implantar a aplicação Termo2 na infraestrutura da DigitalOcean, seguindo a arquitetura cliente-servidor especificada.

## 📋 Arquitetura da Solução

### Frontend (DigitalOcean App Platform - Gratuito)
- **Plataforma**: DigitalOcean App Platform
- **Tipo**: Static Site (Next.js)
- **Plano**: Starter (gratuito)
- **Responsabilidades**: Interface do usuário, renderização da grade e teclado

### Backend (Servidor DigitalOcean - Pago)
- **IP**: 143.110.196.243
- **Tecnologia**: Node.js + Express
- **Containerização**: Docker
- **Responsabilidades**: Lógica do jogo, validação, API REST

## 🛠️ Pré-requisitos

1. **Conta DigitalOcean** ativa
2. **Acesso SSH** ao servidor 143.110.196.243
3. **Docker** instalado localmente
4. **Git** configurado com acesso ao repositório

## 📁 Estrutura do Projeto

```
termo2/
├── app/                    # Frontend Next.js
├── components/            # Componentes React
├── lib/                   # Utilitários e API
├── backend/               # Backend Node.js
│   ├── src/
│   │   └── server.js      # Servidor Express
│   ├── package.json       # Dependências do backend
│   ├── Dockerfile         # Containerização
│   ├── docker-compose.yml # Orquestração local
│   └── deploy.sh          # Script de deploy
├── .do/                   # Configuração DigitalOcean
│   └── app.yaml          # Deploy do frontend
└── README-DEPLOY.md       # Este arquivo
```

## 🚀 Deploy do Backend

### Passo 1: Preparar o Backend Localmente

```bash
cd backend
npm install
```

### Passo 2: Testar Localmente

```bash
# Desenvolvimento
npm run dev

# Ou com Docker
docker-compose up --build
```

### Passo 3: Deploy no Servidor

```bash
# Tornar o script executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

**O script irá:**
1. Construir a imagem Docker
2. Transferir para o servidor
3. Parar o container existente
4. Executar o novo container
5. Configurar restart automático

## 🌐 Deploy do Frontend

### Passo 1: Configurar Repositório

Certifique-se de que o repositório `hpeixotosp/termo2` está atualizado com as mudanças.

### Passo 2: Deploy via DigitalOcean App Platform

1. Acesse o [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Clique em "Create App"
3. Conecte seu repositório GitHub
4. Selecione o repositório `termo2`
5. Configure conforme o arquivo `.do/app.yaml`:
   - **Environment**: Node.js
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Instance Size**: Basic XXS (gratuito)

### Passo 3: Variáveis de Ambiente

Configure as seguintes variáveis:
- `NEXT_PUBLIC_API_URL`: `http://143.110.196.243:3000`
- `NODE_ENV`: `production`

## 🔧 Configurações do Servidor

### Firewall

Certifique-se de que a porta 3000 está aberta:

```bash
# No servidor DigitalOcean
ufw allow 3000
ufw enable
```

### Docker

Verifique se o Docker está rodando:

```bash
# Status do container
docker ps | grep termo2-backend

# Logs do container
docker logs termo2-backend

# Reiniciar se necessário
docker restart termo2-backend
```

## 📊 Monitoramento e Saúde

### Endpoints de Saúde

- **Backend Health**: `http://143.110.196.243:3000/health`
- **API Stats**: `http://143.110.196.243:3000/api/dictionary-stats`

### Logs do Sistema

```bash
# Logs do container
docker logs -f termo2-backend

# Logs do sistema
journalctl -u docker.service -f
```

## 🔄 Atualizações

### Backend

```bash
cd backend
./deploy.sh
```

### Frontend

O frontend será atualizado automaticamente via GitHub:
1. Faça push para a branch `main`
2. O DigitalOcean App Platform fará o rebuild automático

## 🐛 Troubleshooting

### Problemas Comuns

1. **Container não inicia**
   ```bash
   docker logs termo2-backend
   docker exec -it termo2-backend sh
   ```

2. **API não responde**
   ```bash
   curl http://143.110.196.243:3000/health
   netstat -tlnp | grep 3000
   ```

3. **CORS errors**
   - Verificar se `FRONTEND_URL` está configurado corretamente
   - Verificar se o frontend está acessível

### Logs de Debug

```bash
# Logs detalhados do backend
docker logs termo2-backend --tail 100

# Status do sistema
docker system df
docker stats
```

## 📈 Escalabilidade

### Backend
- **Horizontal**: Adicionar mais instâncias do container
- **Vertical**: Aumentar recursos do servidor
- **Load Balancer**: Usar Nginx ou HAProxy

### Frontend
- **CDN**: Configurar Cloudflare ou similar
- **Cache**: Implementar cache de palavras
- **Monitoring**: Adicionar New Relic ou DataDog

## 🔒 Segurança

### Recomendações

1. **HTTPS**: Configurar certificado SSL no frontend
2. **Rate Limiting**: Implementar no backend
3. **Input Validation**: Validar todas as entradas da API
4. **Logs**: Monitorar tentativas de acesso suspeitas

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs do sistema
2. Consultar documentação da DigitalOcean
3. Abrir issue no repositório GitHub

---

**🎯 Status do Deploy**: Pronto para execução
**📅 Última Atualização**: $(date)
**👨‍💻 Desenvolvedor**: Humberto Peixoto
