#!/bin/bash

# Script para testar a API do backend
API_BASE="http://143.110.196.243:3000"

echo "🧪 Testando API do Termo2 Backend..."
echo "📍 Endpoint: $API_BASE"
echo ""

# Teste 1: Health Check
echo "1️⃣ Testando Health Check..."
curl -s "$API_BASE/health" | jq '.' || echo "❌ Health check falhou"

echo ""

# Teste 2: Estatísticas do Dicionário
echo "2️⃣ Testando Estatísticas do Dicionário..."
curl -s "$API_BASE/api/dictionary-stats" | jq '.' || echo "❌ Stats falharam"

echo ""

# Testo 3: Palavra do Dia
echo "3️⃣ Testando Palavra do Dia..."
curl -s "$API_BASE/api/daily-word" | jq '.' || echo "❌ Daily word falhou"

echo ""

# Teste 4: Validação de Tentativa
echo "4️⃣ Testando Validação de Tentativa..."
curl -s -X POST "$API_BASE/api/validate-guess" \
  -H "Content-Type: application/json" \
  -d '{"guess":"amigo","solution":"amigo"}' | jq '.' || echo "❌ Validação falhou"

echo ""

# Teste 5: Validação de Palavra Inválida
echo "5️⃣ Testando Validação de Palavra Inválida..."
curl -s -X POST "$API_BASE/api/validate-guess" \
  -H "Content-Type: application/json" \
  -d '{"guess":"xxxxx","solution":"amigo"}' | jq '.' || echo "❌ Validação inválida falhou"

echo ""

echo "✅ Testes concluídos!"
echo "📊 Para mais detalhes, verifique os logs do servidor"
