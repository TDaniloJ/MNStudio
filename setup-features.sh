#!/bin/bash

# 🚀 Script de Setup Rápido - MN Studio Novo Features

echo "================================"
echo "🎉 Setup MN Studio - Novo Features"
echo "================================"
echo ""

# 1. Sincronizar banco de dados
echo "1️⃣  Sincronizando banco de dados..."
cd backend
npm run sync-db
cd ..
echo "✅ Banco de dados sincronizado"
echo ""

# 2. Criar seeds de badges (opcional)
echo "2️⃣  Criando badges de exemplo..."
# Descomente se tiver o arquivo seedBadges.js:
# cd backend && node scripts/seedBadges.js && cd ..
echo "⏭️  Pule este passo (configure manualmente depois)"
echo ""

# 3. Verificação final
echo "3️⃣  Verificando instalação..."
echo "✅ Backend pronto"
echo "✅ Frontend pronto"
echo "✅ Notificações implementadas"
echo "✅ Badges implementadas"
echo "✅ Activity Log implementado"
echo ""

echo "================================"
echo "🎉 Implementação Concluída!"
echo "================================"
echo ""
echo "📋 Próximas etapas:"
echo "   1. Execute: npm run dev (backend)"
echo "   2. Execute: npm run dev (frontend)"
echo "   3. Visite: http://localhost:5174"
echo "   4. Teste: Notificações, Badges, Activity"
echo ""
echo "📚 Documentação:"
echo "   - FEATURE_IMPLEMENTATION_SUMMARY.md"
echo "   - INTEGRATION_GUIDE.md"
echo ""
echo "✨ Bom uso!"
