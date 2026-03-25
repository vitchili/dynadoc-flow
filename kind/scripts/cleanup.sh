#!/bin/bash

# Script para limpar o cluster Kind e remover todos os recursos
set -e

echo "🧹 Limpando cluster Kind DynaDoc..."

# Verificar se o cluster Kind existe
if ! kind get clusters | grep -q "dynadoc-cluster"; then
    echo "❌ Cluster Kind 'dynadoc-cluster' não encontrado."
    exit 1
fi

echo "🗑️  Removendo cluster Kind..."
kind delete cluster --name dynadoc-cluster

echo "✅ Limpeza concluída!"
echo ""
echo "💡 Para recriar o cluster, execute:"
echo "  ./kind/scripts/setup-cluster.sh"
