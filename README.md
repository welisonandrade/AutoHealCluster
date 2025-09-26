# Sistema de Tarefas - Kubernetes + Prometheus

Aplicação distribuída para demonstração de tolerância a falhas e monitoramento.

## Estrutura do Projeto

- `server/` - Código do servidor (API REST)
- `client/` - Interface web do cliente  
- `kubernetes/` - Configurações do Kubernetes
- `prometheus/` - Configurações do Prometheus

## Como Executar

### 1. Construir a imagem Docker

```bash
docker build -t todo-app:latest .
```

### 2. Iniciar o Minikube

```bash
minikube start
```

### 3. Deploy da aplicação

```bash
# Deploy do Redis
kubectl apply -f kubernetes/redis-deployment.yaml

# Deploy da aplicação
kubectl apply -f kubernetes/todo-app-deployment.yaml

# Deploy do HPA
kubectl apply -f kubernetes/hpa.yaml
```

### 4. Deploy do Prometheus

```bash
# Deploy do Prometheus
kubectl apply -f prometheus/prometheus-deployment.yaml
```

### 5. Acessar a aplicação

```bash
# Obter URL da aplicação
minikube service todo-app-service --url

# Obter URL do Prometheus
minikube service prometheus-service -n monitoring --url
```

## Testes de Tolerância a Falhas

### 1. Teste de Auto-Healing

```bash
# Listar pods
kubectl get pods

# Deletar um pod manualmente
kubectl delete pod <nome-do-pod>

# Verificar se foi recriado
kubectl get pods -w
```

### 2. Teste de Escalonamento (HPA)

```bash
# Verificar status do HPA
kubectl get hpa

# Gerar carga de CPU através da interface web
# Acessar a aplicação e clicar em "Gerar Carga CPU"

# Monitorar escalonamento
kubectl get pods -w
```

## Monitoramento

- **Prometheus**: `http://<minikube-ip>:30000`
- **Aplicação**: `http://<minikube-ip>:<nodeport>`

## Métricas Importantes

- Número de pods ativos
- Uso de CPU por pod
- Status dos pods (Running, Failed, Pending)
- Ações do HPA (escalonamento)