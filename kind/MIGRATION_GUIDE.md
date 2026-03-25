# Guia de Migração: Docker Compose → Kubernetes

Este documento detalha o processo de migração da aplicação DynaDoc do Docker Compose para Kubernetes, explicando cada decisão arquitetural e como os componentes foram mapeados.

## 🎯 Objetivos da Migração

### Problemas Resolvidos

- **Escalabilidade limitada**: Docker Compose não oferece escalonamento automático
- **Alta disponibilidade**: Falta de redundância e failover automático
- **Isolamento de recursos**: Sem controle granular de CPU/memória
- **Gerenciamento de configurações**: Configurações hardcoded nos containers
- **Monitoramento**: Falta de observabilidade nativa

### Benefícios Alcançados

- **Escalabilidade horizontal**: Auto-scaling baseado em métricas
- **Alta disponibilidade**: Distribuição em múltiplos nós
- **Isolamento de recursos**: Namespaces e resource quotas
- **Configuração centralizada**: ConfigMaps e Secrets
- **Observabilidade**: Logs, métricas e traces centralizados

## 🗺️ Mapeamento de Componentes

### Docker Compose → Kubernetes

| Docker Compose | Kubernetes                        | Justificativa              |
| -------------- | --------------------------------- | -------------------------- |
| `user-app`     | `user-service` namespace          | Isolamento por domínio     |
| `template-app` | `template-service` namespace      | Isolamento por domínio     |
| `file-app`     | `file-service` namespace          | Isolamento por domínio     |
| `mysql-db`     | `shared-infrastructure` namespace | Recursos compartilhados    |
| `redis`        | `shared-infrastructure` namespace | Recursos compartilhados    |
| `kafka1/2/3`   | `shared-infrastructure` namespace | Cluster Kafka simplificado |
| `zookeeper`    | `shared-infrastructure` namespace | Dependência do Kafka       |
| `kong`         | `shared-infrastructure` namespace | API Gateway centralizado   |
| `nginx`        | `dynadoc-system` namespace        | Proxy reverso centralizado |
| `frontend`     | `dynadoc-system` namespace        | Interface do usuário       |

### Redes e Comunicação

#### Docker Compose

```yaml
networks:
  laravel-net:
    driver: bridge
```

#### Kubernetes

```yaml
# Cada namespace tem sua própria rede virtual
# Comunicação via DNS interno:
# service-name.namespace.svc.cluster.local
```

**Vantagens**:

- DNS nativo para descoberta de serviços
- Network policies para isolamento
- Load balancing automático entre pods

## 🔧 Configurações Migradas

### 1. Variáveis de Ambiente

#### Docker Compose

```yaml
environment:
  DB_HOST: mysql-db
  DB_PORT: 3306
  DB_DATABASE: user_service
  DB_USERNAME: root
  DB_PASSWORD: root
```

#### Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: user-service-config
data:
  DB_HOST: mysql-service.shared-infrastructure.svc.cluster.local
  DB_PORT: "3306"
  DB_DATABASE: user_service
  DB_USERNAME: root

---
apiVersion: v1
kind: Secret
metadata:
  name: user-service-secret
data:
  DB_PASSWORD: cm9vdA== # root (base64)
```

**Melhorias**:

- Separação de configurações sensíveis (Secrets)
- Configurações não-sensíveis em ConfigMaps
- Aplicação via envFrom para simplificar

### 2. Volumes Persistentes

#### Docker Compose

```yaml
volumes:
  - ./backend/user-service:/var/www/html
  - kong-db-data:/var/lib/postgresql/data
```

#### Kubernetes

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

**Melhorias**:

- Volumes persistentes gerenciados pelo Kubernetes
- Backup automático (com storage class apropriada)
- Provisioning dinâmico de volumes

### 3. Networking e Ingress

#### Docker Compose

```yaml
nginx:
  ports:
    - "8080:80"
  volumes:
    - ./.docker/nginx/nginx.conf:/etc/nginx/nginx.conf
```

#### Kubernetes

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dynadoc-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: localhost
      http:
        paths:
          - path: /api/user
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

**Melhorias**:

- Ingress controller para roteamento HTTP/HTTPS
- SSL termination automática
- Rate limiting e autenticação centralizadas

## 🏗️ Arquitetura de Namespaces

### Estratégia de Organização

```
dynadoc-cluster/
├── dynadoc-system/          # Componentes compartilhados
│   ├── frontend             # Interface do usuário
│   └── nginx                # Proxy reverso
├── user-service/            # Microserviço isolado
├── template-service/        # Microserviço isolado
├── file-service/           # Microserviço isolado
├── shared-infrastructure/   # Infraestrutura compartilhada
│   ├── mysql               # Banco de dados
│   ├── redis               # Cache
│   ├── kafka               # Message broker
│   └── kong                # API Gateway
└── ingress-nginx/          # Ingress controller
```

### Justificativas

1. **Isolamento por domínio**: Cada microserviço tem seu próprio namespace
2. **Recursos compartilhados**: Infraestrutura comum em namespace dedicado
3. **Segurança**: Network policies por namespace
4. **Escalabilidade**: Deploy independente de cada serviço

## 🔒 Segurança

### Network Policies

```yaml
# Isolamento padrão: deny-all
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress

# Permitir apenas tráfego autorizado
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-nginx-to-user-service
spec:
  podSelector:
    matchLabels:
      app: user-service
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: dynadoc-system
    ports:
    - protocol: TCP
      port: 9000
```

### Secrets Management

- Senhas em Secrets com encoding base64
- ConfigMaps para configurações não-sensíveis
- RBAC para controle de acesso aos secrets

## 📊 Monitoramento e Observabilidade

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Resource Limits

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

## 🚀 Processo de Deploy

### Ordem de Deploy

1. **Infraestrutura compartilhada**: MySQL, Redis, Kafka, Kong
2. **Microserviços**: User, Template, File services
3. **Frontend e Proxy**: NGINX e React app
4. **Ingress e Network Policies**: Configuração final

### Scripts de Automação

- `setup-cluster.sh`: Configuração inicial do cluster
- `build-images.sh`: Build e carregamento de imagens
- `deploy.sh`: Deploy completo da aplicação
- `cleanup.sh`: Limpeza do cluster

## 🔄 Migração Gradual

### Estratégia Blue-Green

1. **Manter Docker Compose** funcionando
2. **Deploy em Kubernetes** em paralelo
3. **Testes de funcionalidade** em ambos os ambientes
4. **Migração do tráfego** gradualmente
5. **Descomissionamento** do Docker Compose

### Pontos de Atenção

1. **Persistência de dados**: Migrar dados do MySQL
2. **Sessões Redis**: Transferir cache ativo
3. **Filas Kafka**: Processar mensagens pendentes
4. **Configurações**: Sincronizar ConfigMaps/Secrets

## 📈 Próximos Passos

### Melhorias Planejadas

1. **Auto-scaling**: HPA (Horizontal Pod Autoscaler)
2. **Service Mesh**: Istio para observabilidade avançada
3. **GitOps**: ArgoCD para deploy automatizado
4. **Backup**: Velero para backup de volumes
5. **Monitoring**: Prometheus + Grafana
6. **Logging**: ELK Stack ou Loki

### Considerações de Produção

1. **Multi-node cluster**: Distribuir pods em múltiplos nós
2. **Storage classes**: Usar storage provisioned dinamicamente
3. **Ingress TLS**: Certificados SSL automáticos
4. **Resource quotas**: Limites por namespace
5. **Pod disruption budgets**: Garantir alta disponibilidade

## 🎉 Conclusão

A migração do Docker Compose para Kubernetes com Kind oferece:

- **Melhor escalabilidade** e alta disponibilidade
- **Isolamento de recursos** e segurança aprimorada
- **Configuração centralizada** e versionamento
- **Observabilidade nativa** e debugging facilitado
- **Preparação para produção** com clusters gerenciados

A arquitetura resultante é mais robusta, escalável e preparada para crescimento futuro, mantendo a simplicidade de desenvolvimento local com Kind.
