# DynaDoc - Migração Docker Compose para Kubernetes com Kind

Este diretório contém todos os manifests e scripts necessários para migrar a aplicação DynaDoc do Docker Compose para Kubernetes usando Kind (Kubernetes in Docker).

## 📋 Arquitetura da Aplicação

### Microserviços

- **user-service**: Serviço de usuários (Laravel/PHP)
- **template-service**: Serviço de templates (Laravel/PHP)
- **file-service**: Serviço de arquivos (Laravel/PHP)
- **frontend**: Interface React/Vite

### Infraestrutura Compartilhada

- **MySQL 8**: Banco de dados principal
- **Redis**: Cache e sessões
- **Apache Kafka**: Message broker (com Zookeeper)
- **Kong**: API Gateway
- **NGINX**: Proxy reverso

## 🏗️ Estrutura de Namespaces

```
dynadoc-cluster/
├── dynadoc-system/          # Frontend e NGINX
├── user-service/            # Microserviço de usuários
├── template-service/        # Microserviço de templates
├── file-service/           # Microserviço de arquivos
├── shared-infrastructure/  # MySQL, Redis, Kafka, Kong
└── ingress-nginx/          # NGINX Ingress Controller
```

## 🚀 Guia de Migração

### Pré-requisitos

1. **Kind** instalado:

   ```bash
   brew install kind
   ```

2. **kubectl** instalado:

   ```bash
   brew install kubectl
   ```

3. **Docker** rodando

### Passo a Passo

#### 1. Configurar o Cluster Kind

```bash
./kind/scripts/setup-cluster.sh
```

Este script:

- Cria o cluster Kind com configuração customizada
- Cria todos os namespaces necessários
- Instala o NGINX Ingress Controller
- Configura portas de acesso

#### 2. Construir e Carregar Imagens

```bash
./kind/scripts/build-images.sh
```

Este script:

- Constrói as imagens Docker dos microserviços
- Carrega as imagens no cluster Kind
- Otimiza o processo de build para desenvolvimento

#### 3. Fazer Deploy da Aplicação

```bash
./kind/scripts/deploy.sh
```

Este script:

- Aplica todos os manifests Kubernetes
- Aguarda os serviços ficarem prontos
- Configura ingress e network policies
- Verifica o status da aplicação

### 🧹 Limpeza

```bash
./kind/scripts/cleanup.sh
```

Remove completamente o cluster Kind.

## 📁 Estrutura de Arquivos

```
kind/
├── cluster-config.yaml              # Configuração do cluster Kind
├── namespaces.yaml                  # Definição dos namespaces
├── shared-infrastructure/           # Infraestrutura compartilhada
│   ├── mysql.yaml                   # MySQL com PVC e secrets
│   ├── redis.yaml                   # Redis com persistência
│   ├── kafka.yaml                   # Kafka + Zookeeper
│   └── kong.yaml                    # Kong API Gateway
├── user-service/                    # Microserviço de usuários
│   └── deployment.yaml              # Deployment, Service, ConfigMap, Secret
├── template-service/                # Microserviço de templates
│   └── deployment.yaml              # Deployment, Service, ConfigMap, Secret
├── file-service/                    # Microserviço de arquivos
│   └── deployment.yaml              # Deployment, Service, ConfigMap, Secret
├── frontend/                        # Frontend React
│   └── deployment.yaml              # Deployment e Service
├── nginx/                           # NGINX Proxy
│   ├── nginx-configmap.yaml         # Configuração do NGINX
│   └── nginx-deployment.yaml        # Deployment e Service
├── ingress/                         # Ingress e Network Policies
│   ├── ingress-nginx.yaml           # NGINX Ingress Controller
│   ├── dynadoc-ingress.yaml         # Ingress rules
│   └── network-policies.yaml        # Network policies por namespace
└── scripts/                         # Scripts de automação
    ├── setup-cluster.sh             # Configurar cluster
    ├── build-images.sh              # Construir imagens
    ├── deploy.sh                    # Deploy da aplicação
    └── cleanup.sh                   # Limpeza
```

## 🔧 Configurações Importantes

### Portas Expostas

- **80**: NGINX Ingress (HTTP)
- **443**: NGINX Ingress (HTTPS)
- **8001**: Kong Admin API

### Volumes Persistentes

- **MySQL**: 10Gi para dados do banco
- **Redis**: 5Gi para cache persistente
- **Kafka**: 10Gi para logs e mensagens
- **Kong DB**: 5Gi para configurações do Kong
- **Microserviços**: 5-10Gi cada para código e uploads

### Network Policies

- Isolamento entre namespaces
- Comunicação permitida apenas entre serviços necessários
- Proteção contra tráfego não autorizado

## 🌐 Acessos

Após o deploy, a aplicação estará disponível em:

- **Frontend**: http://localhost
- **User Service API**: http://localhost/api/user
- **Template Service API**: http://localhost/api/template
- **File Service API**: http://localhost/api/file
- **Kong Admin**: http://kong.localhost:8001

## 🔍 Comandos Úteis

### Verificar Status

```bash
# Ver todos os pods
kubectl get pods --all-namespaces

# Ver serviços
kubectl get svc --all-namespaces

# Ver ingress
kubectl get ingress --all-namespaces
```

### Logs

```bash
# Logs de um microserviço
kubectl logs -f deployment/user-service -n user-service

# Logs do NGINX
kubectl logs -f deployment/nginx -n dynadoc-system

# Logs do MySQL
kubectl logs -f deployment/mysql -n shared-infrastructure
```

### Debug

```bash
# Executar comando em pod
kubectl exec -it deployment/user-service -n user-service -- /bin/bash

# Port forward para acesso direto
kubectl port-forward svc/nginx-service 8080:80 -n dynadoc-system

# Descrever recursos
kubectl describe pod <pod-name> -n <namespace>
```

## 🔄 Diferenças do Docker Compose

### Vantagens da Migração

1. **Escalabilidade**: Fácil escalonamento horizontal dos pods
2. **Alta Disponibilidade**: Distribuição em múltiplos nós
3. **Isolamento**: Network policies e namespaces
4. **Monitoramento**: Integração com ferramentas de observabilidade
5. **CI/CD**: Deploy automatizado e rollback
6. **Recursos**: Controle de CPU e memória por pod

### Mudanças na Arquitetura

1. **Namespaces**: Isolamento por microserviço
2. **Services**: Descoberta de serviços via DNS
3. **Ingress**: Roteamento HTTP/HTTPS centralizado
4. **ConfigMaps/Secrets**: Gerenciamento de configurações
5. **PersistentVolumes**: Armazenamento persistente
6. **Health Checks**: Probes de saúde automáticos

## 🐛 Troubleshooting

### Pods não iniciam

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

### Problemas de conectividade

```bash
# Testar conectividade entre serviços
kubectl exec -it deployment/user-service -n user-service -- nslookup mysql-service.shared-infrastructure.svc.cluster.local
```

### Problemas de recursos

```bash
# Ver uso de recursos
kubectl top pods --all-namespaces
kubectl top nodes
```

### Resetar cluster

```bash
./kind/scripts/cleanup.sh
./kind/scripts/setup-cluster.sh
./kind/scripts/build-images.sh
./kind/scripts/deploy.sh
```

## 📚 Próximos Passos

1. **Configurar monitoramento** com Prometheus/Grafana
2. **Implementar CI/CD** com GitHub Actions
3. **Adicionar certificados SSL** com cert-manager
4. **Configurar backup** dos volumes persistentes
5. **Implementar autoscaling** horizontal dos pods
6. **Adicionar service mesh** (Istio/Linkerd) se necessário

## 🤝 Contribuição

Para contribuir com melhorias na configuração Kubernetes:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Teste as mudanças localmente
4. Submeta um pull request

---

**Nota**: Esta configuração é otimizada para desenvolvimento local com Kind. Para produção, considere usar um cluster Kubernetes gerenciado (EKS, GKE, AKS) com configurações de segurança e recursos apropriados.
