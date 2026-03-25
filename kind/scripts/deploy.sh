#!/bin/bash

# Script para fazer deploy de todos os manifests Kubernetes
set -e

echo "🚀 Fazendo deploy da aplicação DynaDoc no Kubernetes..."

# Diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIND_DIR="$(dirname "$SCRIPT_DIR")"

# Verificar se o cluster Kind existe
if ! kind get clusters | grep -q "dynadoc-cluster"; then
    echo "❌ Cluster Kind 'dynadoc-cluster' não encontrado. Execute primeiro o script setup-cluster.sh"
    exit 1
fi

# Função para aplicar manifests com feedback
apply_manifests() {
    local dir=$1
    local description=$2
    
    echo "📦 $description..."
    if [ -d "$dir" ]; then
        kubectl apply -f "$dir"
        echo "✅ $description aplicado com sucesso"
    else
        echo "⚠️  Diretório $dir não encontrado, pulando..."
    fi
}

# Aplicar manifests na ordem correta
echo "🔧 Aplicando infraestrutura compartilhada..."
apply_manifests "$KIND_DIR/shared-infrastructure" "Infraestrutura compartilhada (MySQL, Redis, Kafka, Kong)"

echo "⏳ Aguardando infraestrutura ficar pronta..."
kubectl wait --for=condition=ready pod -l app=mysql --namespace=shared-infrastructure --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis --namespace=shared-infrastructure --timeout=300s
kubectl wait --for=condition=ready pod -l app=zookeeper --namespace=shared-infrastructure --timeout=300s
kubectl wait --for=condition=ready pod -l app=kafka --namespace=shared-infrastructure --timeout=300s
kubectl wait --for=condition=ready pod -l app=kong-db --namespace=shared-infrastructure --timeout=300s
kubectl wait --for=condition=ready pod -l app=kong --namespace=shared-infrastructure --timeout=300s

echo "👤 Aplicando microserviços..."
apply_manifests "$KIND_DIR/user-service" "User Service"
apply_manifests "$KIND_DIR/template-service" "Template Service"
apply_manifests "$KIND_DIR/file-service" "File Service"

echo "🌐 Aplicando frontend e nginx..."
apply_manifests "$KIND_DIR/frontend" "Frontend"
apply_manifests "$KIND_DIR/nginx" "NGINX"

echo "🔗 Aplicando ingress e network policies..."
apply_manifests "$KIND_DIR/ingress" "Ingress e Network Policies"

echo "⏳ Aguardando todos os pods ficarem prontos..."
kubectl wait --for=condition=ready pod -l app=user-service --namespace=user-service --timeout=300s
kubectl wait --for=condition=ready pod -l app=template-service --namespace=template-service --timeout=300s
kubectl wait --for=condition=ready pod -l app=file-service --namespace=file-service --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend --namespace=dynadoc-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=nginx --namespace=dynadoc-system --timeout=300s

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📋 Status da aplicação:"
kubectl get pods --all-namespaces
echo ""
echo "🌐 Endpoints disponíveis:"
echo "  - Aplicação principal: http://localhost"
echo "  - Kong Admin: http://kong.localhost:8001"
echo ""
echo "🔍 Comandos úteis:"
echo "  - Ver logs: kubectl logs -f deployment/user-service -n user-service"
echo "  - Port forward: kubectl port-forward svc/nginx-service 8080:80 -n dynadoc-system"
echo "  - Status completo: kubectl get all --all-namespaces"
echo ""
echo "🎉 DynaDoc está rodando no Kubernetes!"
