#!/bin/bash

# Script para construir as imagens Docker dos microserviços
set -e

echo "🔨 Construindo imagens Docker para o cluster Kind..."

# Diretório raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Função para construir imagem
build_image() {
    local service_name=$1
    local dockerfile_path=$2
    local context_path=$3
    
    echo "📦 Construindo imagem: $service_name"
    
    # Build da imagem
    docker build -t "$service_name:latest" -f "$dockerfile_path" "$context_path"
    
    # Load da imagem para o Kind
    kind load docker-image "$service_name:latest" --name dynadoc-cluster
    
    echo "✅ Imagem $service_name construída e carregada no Kind"
}

# Verificar se o cluster Kind existe
if ! kind get clusters | grep -q "dynadoc-cluster"; then
    echo "❌ Cluster Kind 'dynadoc-cluster' não encontrado. Execute primeiro o script setup-cluster.sh"
    exit 1
fi

# Construir imagens dos microserviços Laravel
build_image "user-service" "$PROJECT_ROOT/backend/user-service/Dockerfile" "$PROJECT_ROOT/backend/user-service"
build_image "template-service" "$PROJECT_ROOT/backend/template-service/Dockerfile" "$PROJECT_ROOT/backend/template-service"
build_image "file-service" "$PROJECT_ROOT/backend/file-service/Dockerfile" "$PROJECT_ROOT/backend/file-service"

# Construir imagem do frontend
build_image "frontend" "$PROJECT_ROOT/frontend/Dockerfile" "$PROJECT_ROOT/frontend"

echo "🎉 Todas as imagens foram construídas e carregadas no cluster Kind!"
echo ""
echo "📋 Imagens disponíveis:"
echo "  - user-service:latest"
echo "  - template-service:latest"
echo "  - file-service:latest"
echo "  - frontend:latest"
echo ""
echo "🚀 Próximo passo: Execute o script deploy.sh para aplicar os manifests Kubernetes"
