### Redis Cluster - Configuração

- Exponha nós do cluster no formato `host:port` separados por vírgula.
- Defina as variáveis de ambiente:

```bash
REDIS_CLUSTER_NODES=10.0.0.10:6379,10.0.0.11:6379,10.0.0.12:6379
REDIS_PASSWORD=senha_secreta
```

- Alternativamente, use `REDIS_URL=redis://:senha@host:6379` para instância única.
- O `queueManager` detecta `REDIS_CLUSTER_NODES` e cria clientes Bull via ioredis Cluster.
- Verifique a saúde em `/api/queues/health` e métricas em `/api/queues/stats`.