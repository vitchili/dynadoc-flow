#!/bin/bash

# Script para configurar o cluster Kind e instalar dependências
set -e

echo "🚀 Configurando cluster Kind para DynaDoc..."

# Diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIND_DIR="$(dirname "$SCRIPT_DIR")"

# Verificar se Kind está instalado
if ! command -v kind &> /dev/null; then
    echo "❌ Kind não está instalado. Por favor, instale o Kind primeiro:"
    echo "   brew install kind"
    echo "   ou visite: https://kind.sigs.k8s.io/docs/user/quick-start/"
    exit 1
fi

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado. Por favor, instale o kubectl primeiro:"
    echo "   brew install kubectl"
    echo "   ou visite: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Criar cluster Kind se não existir
if kind get clusters | grep -q "dynadoc-cluster"; then
    echo "📦 Cluster 'dynadoc-cluster' já existe. Removendo..."
    kind delete cluster --name dynadoc-cluster
fi

echo "🏗️  Criando cluster Kind..."
kind create cluster --config="$KIND_DIR/cluster-config.yaml"

# Aguardar cluster ficar pronto
echo "⏳ Aguardando cluster ficar pronto..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

# Aplicar namespaces
echo "📁 Criando namespaces..."
kubectl apply -f "$KIND_DIR/namespaces.yaml"

# Instalar NGINX Ingress Controller
echo "🌐 Instalando NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Aguardar ingress controller ficar pronto
echo "⏳ Aguardando NGINX Ingress Controller ficar pronto..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Aplicar configuração customizada do ingress
echo "🔧 Aplicando configuração customizada do ingress..."
kubectl apply -f "$KIND_DIR/ingress/ingress-nginx.yaml"

echo "✅ Cluster Kind configurado com sucesso!"
echo ""
echo "📋 Informações do cluster:"
echo "  Nome: dynadoc-cluster"
echo "  Contexto kubectl: kind-dynadoc-cluster"
echo ""
echo "🌐 Endpoints disponíveis:"
echo "  - NGINX Ingress: http://localhost"
echo "  - Kong Admin: http://kong.localhost:8001"
echo ""
echo "🚀 Próximos passos:"
echo "  1. Execute: ./kind/scripts/build-images.sh"
echo "  2. Execute: ./kind/scripts/deploy.sh"
echo ""
echo "🔍 Para verificar o status do cluster:"
echo "  kubectl get nodes"
echo "  kubectl get pods --all-namespaces"
