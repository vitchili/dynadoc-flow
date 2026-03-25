#!/bin/bash

# Script para verificar a saúde da aplicação DynaDoc no Kubernetes
set -e

echo "🏥 Verificando saúde da aplicação DynaDoc..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar status
check_status() {
    local resource=$1
    local namespace=$2
    local description=$3
    
    echo -n "🔍 $description... "
    
    if kubectl get $resource -n $namespace >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERRO${NC}"
        return 1
    fi
}

# Função para verificar pods
check_pods() {
    local namespace=$1
    local app_label=$2
    local description=$3
    
    echo -n "🔍 $description... "
    
    local ready_pods=$(kubectl get pods -n $namespace -l app=$app_label --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
    local total_pods=$(kubectl get pods -n $namespace -l app=$app_label --no-headers 2>/dev/null | wc -l)
    
    if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
        echo -e "${GREEN}✅ $ready_pods/$total_pods pods prontos${NC}"
        return 0
    else
        echo -e "${RED}❌ $ready_pods/$total_pods pods prontos${NC}"
        return 1
    fi
}

# Função para testar conectividade
test_connectivity() {
    local service=$1
    local namespace=$2
    local port=$3
    local description=$4
    
    echo -n "🔍 $description... "
    
    if kubectl exec -n $namespace deployment/$service -- nc -z $service $port 2>/dev/null; then
        echo -e "${GREEN}✅ Conectividade OK${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro de conectividade${NC}"
        return 1
    fi
}

echo "📊 Verificando status geral do cluster..."
echo ""

# Verificar se cluster existe
if ! kind get clusters | grep -q "dynadoc-cluster"; then
    echo -e "${RED}❌ Cluster Kind 'dynadoc-cluster' não encontrado${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Status do Cluster:${NC}"
kubectl get nodes
echo ""

echo -e "${BLUE}📋 Status dos Namespaces:${NC}"
kubectl get namespaces | grep -E "(dynadoc|user|template|file|shared|ingress)"
echo ""

echo -e "${BLUE}📋 Verificação de Pods:${NC}"

# Verificar pods por namespace
check_pods "shared-infrastructure" "mysql" "MySQL Database"
check_pods "shared-infrastructure" "redis" "Redis Cache"
check_pods "shared-infrastructure" "zookeeper" "Zookeeper"
check_pods "shared-infrastructure" "kafka" "Kafka Broker"
check_pods "shared-infrastructure" "kong-db" "Kong Database"
check_pods "shared-infrastructure" "kong" "Kong API Gateway"

check_pods "user-service" "user-service" "User Service"
check_pods "template-service" "template-service" "Template Service"
check_pods "file-service" "file-service" "File Service"

check_pods "dynadoc-system" "frontend" "Frontend"
check_pods "dynadoc-system" "nginx" "NGINX Proxy"

check_pods "ingress-nginx" "ingress-nginx" "NGINX Ingress Controller"

echo ""
echo -e "${BLUE}📋 Verificação de Serviços:${NC}"

# Verificar serviços
check_status "svc/mysql-service" "shared-infrastructure" "MySQL Service"
check_status "svc/redis-service" "shared-infrastructure" "Redis Service"
check_status "svc/kafka-service" "shared-infrastructure" "Kafka Service"
check_status "svc/kong-service" "shared-infrastructure" "Kong Service"

check_status "svc/user-service" "user-service" "User Service"
check_status "svc/template-service" "template-service" "Template Service"
check_status "svc/file-service" "file-service" "File Service"

check_status "svc/frontend-service" "dynadoc-system" "Frontend Service"
check_status "svc/nginx-service" "dynadoc-system" "NGINX Service"

echo ""
echo -e "${BLUE}📋 Verificação de Ingress:${NC}"

check_status "ingress/dynadoc-ingress" "dynadoc-system" "DynaDoc Ingress"
check_status "ingress/kong-ingress" "shared-infrastructure" "Kong Ingress"

echo ""
echo -e "${BLUE}📋 Teste de Conectividade:${NC}"

# Testar conectividade entre serviços
echo "🔍 Testando conectividade interna..."

# Testar MySQL
if kubectl exec -n user-service deployment/user-service -- nc -z mysql-service.shared-infrastructure.svc.cluster.local 3306 2>/dev/null; then
    echo -e "  ${GREEN}✅ User Service → MySQL${NC}"
else
    echo -e "  ${RED}❌ User Service → MySQL${NC}"
fi

# Testar Redis
if kubectl exec -n user-service deployment/user-service -- nc -z redis-service.shared-infrastructure.svc.cluster.local 6379 2>/dev/null; then
    echo -e "  ${GREEN}✅ User Service → Redis${NC}"
else
    echo -e "  ${RED}❌ User Service → Redis${NC}"
fi

# Testar Kafka
if kubectl exec -n user-service deployment/user-service -- nc -z kafka-service.shared-infrastructure.svc.cluster.local 9092 2>/dev/null; then
    echo -e "  ${GREEN}✅ User Service → Kafka${NC}"
else
    echo -e "  ${RED}❌ User Service → Kafka${NC}"
fi

echo ""
echo -e "${BLUE}📋 Verificação de Recursos:${NC}"

# Verificar uso de recursos
echo "🔍 CPU e Memória por namespace:"
kubectl top pods --all-namespaces --sort-by=memory 2>/dev/null || echo -e "  ${YELLOW}⚠️  Métricas não disponíveis (instale metrics-server)${NC}"

echo ""
echo -e "${BLUE}📋 Endpoints Disponíveis:${NC}"
echo "🌐 Frontend: http://localhost"
echo "🌐 Kong Admin: http://kong.localhost:8001"
echo "🌐 NGINX Ingress: http://localhost (porta 80)"

echo ""
echo -e "${BLUE}📋 Comandos Úteis:${NC}"
echo "📝 Ver logs: kubectl logs -f deployment/user-service -n user-service"
echo "🔧 Executar shell: kubectl exec -it deployment/user-service -n user-service -- /bin/bash"
echo "📊 Port forward: kubectl port-forward svc/nginx-service 8080:80 -n dynadoc-system"
echo "🗑️  Limpar cluster: ./kind/scripts/cleanup.sh"

echo ""
echo -e "${GREEN}🎉 Verificação de saúde concluída!${NC}"
