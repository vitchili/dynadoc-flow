# Arquitetura DynaDoc - Kubernetes

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        DynaDoc Cluster                         │
│                      (kind-dynadoc-cluster)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Ingress Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   NGINX Ingress │  │  Kong Ingress   │  │  Network        │ │
│  │   Controller    │  │  (API Gateway)  │  │  Policies       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    dynadoc-system                              │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │    Frontend     │  │     NGINX       │                      │
│  │   (React/Vite)  │  │   (Proxy)       │                      │
│  │     :5173       │  │     :80         │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Microserviços                              │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  user-service   │  │template-service │  │  file-service   │ │
│  │   namespace     │  │   namespace     │  │   namespace     │ │
│  │                 │  │                 │  │                 │ │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │ │
│  │  │   Pod     │  │  │  │   Pod     │  │  │  │   Pod     │  │ │
│  │  │ (Laravel) │  │  │  │ (Laravel) │  │  │  │ (Laravel) │  │ │
│  │  │   :9000   │  │  │  │   :9000   │  │  │  │   :9000   │  │ │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │ │
│  │                 │  │                 │  │                 │ │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │ │
│  │  │ Service   │  │  │  │ Service   │  │  │  │ Service   │  │ │
│  │  │  ClusterIP│  │  │  │  ClusterIP│  │  │  │  ClusterIP│  │ │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                shared-infrastructure                           │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │      MySQL      │  │      Redis      │  │     Kafka       │ │
│  │    Database     │  │     Cache       │  │ Message Broker  │ │
│  │     :3306       │  │     :6379       │  │     :9092       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Kong API      │  │   Kong DB       │  │   Zookeeper     │ │
│  │    Gateway      │  │  (PostgreSQL)   │  │   (Kafka)       │ │
│  │   :8000/:8001   │  │     :5432       │  │     :2181       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### 1. Requisições HTTP

```
Cliente → NGINX Ingress → NGINX Proxy → Microserviços Laravel
```

### 2. Comunicação Interna

```
Microserviços → MySQL (Banco de Dados)
Microserviços → Redis (Cache/Sessões)
Microserviços → Kafka (Message Queue)
Microserviços → Kong (API Gateway)
```

### 3. Descoberta de Serviços

```
service-name.namespace.svc.cluster.local:port
```

## 📊 Recursos e Limites

### Namespace: dynadoc-system

| Componente | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ---------- | ----------- | --------- | -------------- | ------------ |
| Frontend   | 100m        | 250m      | 256Mi          | 512Mi        |
| NGINX      | 100m        | 200m      | 128Mi          | 256Mi        |

### Namespace: user-service

| Componente   | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ------------ | ----------- | --------- | -------------- | ------------ |
| User Service | 250m        | 500m      | 512Mi          | 1Gi          |

### Namespace: template-service

| Componente       | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ---------------- | ----------- | --------- | -------------- | ------------ |
| Template Service | 250m        | 500m      | 512Mi          | 1Gi          |

### Namespace: file-service

| Componente   | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ------------ | ----------- | --------- | -------------- | ------------ |
| File Service | 250m        | 500m      | 512Mi          | 1Gi          |

### Namespace: shared-infrastructure

| Componente | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ---------- | ----------- | --------- | -------------- | ------------ |
| MySQL      | 250m        | 500m      | 512Mi          | 1Gi          |
| Redis      | 100m        | 250m      | 256Mi          | 512Mi        |
| Kafka      | 500m        | 1000m     | 1Gi            | 2Gi          |
| Zookeeper  | 250m        | 500m      | 512Mi          | 1Gi          |
| Kong       | 250m        | 500m      | 512Mi          | 1Gi          |
| Kong DB    | 250m        | 500m      | 256Mi          | 512Mi        |

## 🔒 Network Policies

### Isolamento por Namespace

```
┌─────────────────────────────────────────────────────────────────┐
│                    Network Isolation                           │
│                                                                 │
│  dynadoc-system ──────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌─────────────┐                       │ │
│  │  │   Frontend  │  │    NGINX    │                       │ │
│  │  │             │  │             │                       │ │
│  │  └─────────────┘  └─────────────┘                       │ │
│  │         │                 │                             │ │
│  │         └─────────────────┘                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                               │
│  user-service ───────────────┼──────────────────────────────┐ │
│  │                          │                              │ │
│  │  ┌─────────────────────┐ │                              │ │
│  │  │   User Service Pod  │ │                              │ │
│  │  │                     │ │                              │ │
│  │  └─────────────────────┘ │                              │ │
│  └──────────────────────────┼──────────────────────────────┘ │
│                              │                               │
│  template-service ───────────┼──────────────────────────────┐ │
│  │                          │                              │ │
│  │  ┌─────────────────────┐ │                              │ │
│  │  │ Template Service Pod│ │                              │ │
│  │  │                     │ │                              │ │
│  │  └─────────────────────┘ │                              │ │
│  └──────────────────────────┼──────────────────────────────┘ │
│                              │                               │
│  file-service ───────────────┼──────────────────────────────┐ │
│  │                          │                              │ │
│  │  ┌─────────────────────┐ │                              │ │
│  │  │  File Service Pod   │ │                              │ │
│  │  │                     │ │                              │ │
│  │  └─────────────────────┘ │                              │ │
│  └──────────────────────────┼──────────────────────────────┘ │
│                              │                               │
│  shared-infrastructure ──────┼──────────────────────────────┐ │
│  │                          │                              │ │
│  │  ┌─────────┐ ┌─────────┐ │                              │ │
│  │  │  MySQL  │ │  Redis  │ │                              │ │
│  │  └─────────┘ └─────────┘ │                              │ │
│  │                          │                              │ │
│  │  ┌─────────┐ ┌─────────┐ │                              │ │
│  │  │  Kafka  │ │  Kong   │ │                              │ │
│  │  └─────────┘ └─────────┘ │                              │ │
│  └──────────────────────────┼──────────────────────────────┘ │
│                              │                               │
│  ingress-nginx ──────────────┼──────────────────────────────┐ │
│  │                          │                              │ │
│  │  ┌─────────────────────┐ │                              │ │
│  │  │  Ingress Controller │ │                              │ │
│  │  │                     │ │                              │ │
│  │  └─────────────────────┘ │                              │ │
│  └──────────────────────────┼──────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   External Access   │
                    │   (localhost:80)    │
                    └─────────────────────┘
```

### Regras de Comunicação

- **dynadoc-system** pode acessar todos os microserviços
- **Microserviços** só podem acessar shared-infrastructure
- **shared-infrastructure** é isolado de acesso externo
- **ingress-nginx** pode acessar dynadoc-system

## 📈 Escalabilidade

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: user-service-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  updatePolicy:
    updateMode: "Auto"
```

## 🔧 Configuração de Volumes

### Persistent Volume Claims

```
┌─────────────────────────────────────────────────────────────────┐
│                    Storage Layout                               │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   MySQL PVC     │  │   Redis PVC     │  │   Kafka PVC     │ │
│  │     10Gi        │  │      5Gi        │  │     10Gi        │ │
│  │   RWO           │  │      RWO        │  │      RWO        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Kong DB PVC    │  │ User Service    │  │Template Service │ │
│  │      5Gi        │  │     PVC         │  │     PVC         │ │
│  │      RWO        │  │     5Gi         │  │     5Gi         │ │
│  │                 │  │     RWO         │  │     RWO         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ File Service    │  │   NGINX PVC     │                      │
│  │     PVC         │  │                 │                      │
│  │     10Gi        │  │     10Gi        │                      │
│  │     RWO         │  │     RWO         │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Deploy Strategy

### Rolling Update

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

### Blue-Green Deployment

```yaml
# Deploy com labels diferentes
metadata:
  labels:
    version: blue
    # ou
    version: green
```

## 📊 Monitoramento

### Health Checks

```
┌─────────────────────────────────────────────────────────────────┐
│                    Health Monitoring                           │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ Liveness    │    │ Readiness   │    │ Startup     │        │
│  │ Probe       │    │ Probe       │    │ Probe       │        │
│  │             │    │             │    │             │        │
│  │ HTTP GET    │    │ HTTP GET    │    │ HTTP GET    │        │
│  │ /health     │    │ /ready      │    │ /startup    │        │
│  │             │    │             │    │             │        │
│  │ initial: 30s│    │ initial: 5s │    │ initial: 10s│        │
│  │ period: 10s │    │ period: 5s  │    │ period: 1s  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Metrics Collection

- **CPU Usage**: Por pod e namespace
- **Memory Usage**: Por pod e namespace
- **Network I/O**: Tráfego entre pods
- **Storage I/O**: Read/Write operations
- **Application Metrics**: Custom Laravel metrics

## 🔐 Segurança

### RBAC (Role-Based Access Control)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dynadoc-developer
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "configmaps"]
    verbs: ["get", "list", "watch"]
```

### Pod Security Standards

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  seccompProfile:
    type: RuntimeDefault
```

## 🌐 Service Discovery

### DNS Resolution

```
service-name.namespace.svc.cluster.local
```

### Examples

- `mysql-service.shared-infrastructure.svc.cluster.local:3306`
- `redis-service.shared-infrastructure.svc.cluster.local:6379`
- `kafka-service.shared-infrastructure.svc.cluster.local:9092`
- `user-service.user-service.svc.cluster.local:9000`

Esta arquitetura fornece uma base sólida e escalável para a aplicação DynaDoc, com isolamento adequado, segurança e facilidade de manutenção.
