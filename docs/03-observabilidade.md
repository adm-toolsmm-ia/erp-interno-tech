# 📊 ERP Observabilidade — ERPInternoTech

## Estratégia de Observabilidade

### Fase 1 (MVP) - Observabilidade Mínima
- **Health checks** básicos
- **Logs** estruturados
- **Métricas** essenciais
- **Alertas** críticos

### Fase 2 (Evolução) - Observabilidade Avançada
- **Tracing** distribuído
- **Métricas** de negócio
- **Dashboards** interativos
- **Análise** de performance

## 🏥 Health Checks

### Endpoint Principal
```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      supabase: await checkSupabase(),
      storage: await checkStorage()
    }
  };
  
  return Response.json(health);
}
```

### Verificações de Dependências
```typescript
async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database check failed:', error);
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis check failed:', error);
    return false;
  }
}

async function checkSupabase(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('empresas').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase check failed:', error);
    return false;
  }
}
```

## 📝 Logs Estruturados

### Formato Padrão
```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  version: string;
  environment: string;
  empresaId: string;
  requestId: string;
  userId?: string;
  event: string;
  message: string;
  payload: Record<string, any>;
  metadata: {
    userAgent?: string;
    ip?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
  };
}
```

### Logger Estruturado
```typescript
export class StructuredLogger {
  private logger: winston.Logger;
  
  constructor(serviceName: string = 'erp-interno-tech') {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: serviceName,
        version: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });
  }
  
  info(event: string, message: string, payload: Record<string, any>, context: LogContext) {
    this.logger.info({
      ...context,
      event,
      message,
      payload: this.sanitizePayload(payload)
    });
  }
  
  error(event: string, message: string, error: Error, context: LogContext) {
    this.logger.error({
      ...context,
      event,
      message,
      payload: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    });
  }
  
  private sanitizePayload(payload: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'creditCard'];
    
    return Object.keys(payload).reduce((acc, key) => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        acc[key] = '[REDACTED]';
      } else if (typeof payload[key] === 'object' && payload[key] !== null) {
        acc[key] = this.sanitizePayload(payload[key]);
      } else {
        acc[key] = payload[key];
      }
      return acc;
    }, {} as Record<string, any>);
  }
}
```

### Middleware de Logging
```typescript
export function loggingMiddleware(logger: StructuredLogger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || crypto.randomUUID();
    
    const context: LogContext = {
      empresaId: req.user?.empresaId || 'unknown',
      requestId,
      userId: req.user?.id
    };
    
    // Log da requisição
    logger.info('http_request_started', 'HTTP request started', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }, context);
    
    // Interceptar resposta
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      
      logger.info('http_request_completed', 'HTTP request completed', {
        statusCode: res.statusCode,
        duration,
        responseSize: Buffer.byteLength(data, 'utf8')
      }, context);
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}
```

## 📈 Métricas

### Métricas de Performance
```typescript
export class PerformanceMetrics {
  private requestCounter: Counter<string>;
  private requestDuration: Histogram<string>;
  private errorCounter: Counter<string>;
  
  constructor() {
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'empresa_id']
    });
    
    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'empresa_id'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });
    
    this.errorCounter = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status_code', 'empresa_id']
    });
  }
  
  recordRequest(method: string, route: string, statusCode: number, empresaId: string, duration: number) {
    this.requestCounter.inc({ method, route, status_code: statusCode.toString(), empresa_id: empresaId });
    this.requestDuration.observe({ method, route, empresa_id: empresaId }, duration / 1000);
    
    if (statusCode >= 400) {
      this.errorCounter.inc({ method, route, status_code: statusCode.toString(), empresa_id: empresaId });
    }
  }
}
```

### Métricas de Negócio
```typescript
export class BusinessMetrics {
  private projetosCriados: Counter<string>;
  private orcamentosAprovados: Counter<string>;
  private documentosUploaded: Counter<string>;
  
  constructor() {
    this.projetosCriados = new Counter({
      name: 'projetos_criados_total',
      help: 'Total number of projects created',
      labelNames: ['empresa_id', 'status']
    });
    
    this.orcamentosAprovados = new Counter({
      name: 'orcamentos_aprovados_total',
      help: 'Total number of approved budgets',
      labelNames: ['empresa_id', 'valor_range']
    });
    
    this.documentosUploaded = new Counter({
      name: 'documentos_uploaded_total',
      help: 'Total number of documents uploaded',
      labelNames: ['empresa_id', 'categoria']
    });
  }
  
  recordProjetoCreated(empresaId: string, status: string) {
    this.projetosCriados.inc({ empresa_id: empresaId, status });
  }
  
  recordOrcamentoAprovado(empresaId: string, valor: number) {
    const valorRange = this.getValorRange(valor);
    this.orcamentosAprovados.inc({ empresa_id: empresaId, valor_range: valorRange });
  }
  
  recordDocumentoUploaded(empresaId: string, categoria: string) {
    this.documentosUploaded.inc({ empresa_id: empresaId, categoria });
  }
  
  private getValorRange(valor: number): string {
    if (valor < 1000) return '0-1k';
    if (valor < 5000) return '1k-5k';
    if (valor < 10000) return '5k-10k';
    if (valor < 50000) return '10k-50k';
    return '50k+';
  }
}
```

## 🔍 Tracing Distribuído

### OpenTelemetry Setup
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'erp-interno-tech',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Custom Spans
```typescript
import { trace } from '@opentelemetry/api';

export class TracingService {
  private tracer = trace.getTracer('erp-interno-tech');
  
  async traceOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    attributes: Record<string, any> = {}
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName, {
      attributes: {
        'operation.name': operationName,
        'empresa.id': attributes.empresaId,
        'user.id': attributes.userId,
        ...attributes
      }
    });
    
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: (error as Error).message 
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }
}
```

## 🚨 Alertas e Monitoramento

### Configuração de Alertas
```yaml
# monitoring/alerts.yml
groups:
  - name: erp-interno-tech
    rules:
      - alert: HighErrorRate
        expr: rate(http_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
      
      - alert: DatabaseDown
        expr: up{job="database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "Database health check failed"
```

### Dashboard Grafana
```json
{
  "dashboard": {
    "title": "ERP Interno Tech - Multi-Tenant",
    "panels": [
      {
        "title": "Request Rate by Tenant",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m]) by (empresa_id)",
            "legendFormat": "{{empresa_id}}"
          }
        ]
      },
      {
        "title": "Response Time P95",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95 Response Time"
          }
        ]
      },
      {
        "title": "Business Metrics",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(projetos_criados_total[5m])",
            "legendFormat": "Projetos Criados"
          },
          {
            "expr": "rate(orcamentos_aprovados_total[5m])",
            "legendFormat": "Orçamentos Aprovados"
          }
        ]
      }
    ]
  }
}
```

## 📊 Métricas de IA

### Embeddings e Performance
```typescript
export class AIMetrics {
  private embeddingCounter: Counter<string>;
  private embeddingDuration: Histogram<string>;
  private embeddingCost: Counter<string>;
  
  constructor() {
    this.embeddingCounter = new Counter({
      name: 'ai_embeddings_total',
      help: 'Total number of embeddings generated',
      labelNames: ['empresa_id', 'provider', 'model']
    });
    
    this.embeddingDuration = new Histogram({
      name: 'ai_embedding_duration_seconds',
      help: 'Duration of embedding generation in seconds',
      labelNames: ['empresa_id', 'provider', 'model']
    });
    
    this.embeddingCost = new Counter({
      name: 'ai_embedding_cost_total',
      help: 'Total cost of embeddings in USD',
      labelNames: ['empresa_id', 'provider', 'model']
    });
  }
  
  recordEmbedding(empresaId: string, provider: string, model: string, duration: number, cost: number) {
    this.embeddingCounter.inc({ empresa_id: empresaId, provider, model });
    this.embeddingDuration.observe({ empresa_id: empresaId, provider, model }, duration);
    this.embeddingCost.inc({ empresa_id: empresaId, provider, model }, cost);
  }
}
```

## 📋 Checklist de Observabilidade

### Fase 1 (MVP)
- [ ] **Health checks** implementados
- [ ] **Logs estruturados** ativos
- [ ] **Métricas básicas** coletadas
- [ ] **Alertas críticos** configurados

### Fase 2 (Evolução)
- [ ] **Tracing distribuído** ativo
- [ ] **Métricas de negócio** implementadas
- [ ] **Dashboards** interativos
- [ ] **Análise** de performance

### Monitoramento
- [ ] **Alertas** automáticos funcionando
- [ ] **Logs** centralizados
- [ ] **Métricas** de IA ativas
- [ ] **SLA** definido e medido
