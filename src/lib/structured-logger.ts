/**
 * Logger estruturado para o ERP Interno Tech
 * Implementa logs estruturados com contexto multi-tenant
 */

import { v4 as uuidv4 } from 'uuid';

interface LogContext {
  tenantId: string;
  requestId: string;
  userId?: string;
  correlationId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  version: string;
  environment: string;
  tenantId: string;
  requestId: string;
  userId?: string;
  correlationId?: string;
  sessionId?: string;
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
    memoryUsage?: NodeJS.MemoryUsage;
  };
}

interface LoggerConfig {
  service: string;
  version: string;
  environment: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
}

class StructuredLogger {
  private config: LoggerConfig;
  private context: Partial<LogContext> = {};

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      service: process.env.SERVICE_NAME || 'erp-interno-tech',
      version: process.env.SERVICE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      ...config
    };
  }

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private createLogEntry(
    level: LogEntry['level'],
    event: string,
    message: string,
    payload: Record<string, any>,
    metadata: Partial<LogEntry['metadata']> = {}
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      service: this.config.service,
      version: this.config.version,
      environment: this.config.environment,
      tenantId: this.context.tenantId || 'unknown',
      requestId: this.context.requestId || uuidv4(),
      userId: this.context.userId,
      correlationId: this.context.correlationId,
      sessionId: this.context.sessionId,
      event,
      message,
      payload: this.sanitizePayload(payload),
      metadata: {
        userAgent: this.context.userAgent,
        ip: this.context.ip,
        memoryUsage: process.memoryUsage(),
        ...metadata
      }
    };
  }

  private sanitizePayload(payload: Record<string, any>): Record<string, any> {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'creditCard', 'ssn', 'cpf',
      'creditCardNumber', 'cvv', 'pin', 'apiKey', 'privateKey', 'refreshToken'
    ];
    
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

  private writeLog(logEntry: LogEntry): void {
    if (!this.shouldLog(logEntry.level)) return;

    const logString = JSON.stringify(logEntry);

    if (this.config.enableConsole) {
      switch (logEntry.level) {
        case 'debug':
          console.debug(logString);
          break;
        case 'info':
          console.info(logString);
          break;
        case 'warn':
          console.warn(logString);
          break;
        case 'error':
        case 'fatal':
          console.error(logString);
          break;
      }
    }

    // TODO: Implementar file logging e remote logging quando necessário
    // if (this.config.enableFile) { ... }
    // if (this.config.enableRemote) { ... }
  }

  debug(event: string, message: string, payload: Record<string, any> = {}, metadata?: Partial<LogEntry['metadata']>): void {
    this.writeLog(this.createLogEntry('debug', event, message, payload, metadata));
  }

  info(event: string, message: string, payload: Record<string, any> = {}, metadata?: Partial<LogEntry['metadata']>): void {
    this.writeLog(this.createLogEntry('info', event, message, payload, metadata));
  }

  warn(event: string, message: string, payload: Record<string, any> = {}, metadata?: Partial<LogEntry['metadata']>): void {
    this.writeLog(this.createLogEntry('warn', event, message, payload, metadata));
  }

  error(event: string, message: string, error?: Error, payload: Record<string, any> = {}, metadata?: Partial<LogEntry['metadata']>): void {
    const errorPayload = {
      ...payload,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.writeLog(this.createLogEntry('error', event, message, errorPayload, metadata));
  }

  fatal(event: string, message: string, error?: Error, payload: Record<string, any> = {}, metadata?: Partial<LogEntry['metadata']>): void {
    const errorPayload = {
      ...payload,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.writeLog(this.createLogEntry('fatal', event, message, errorPayload, metadata));
  }

  // Métodos de conveniência para operações comuns
  logApiCall(method: string, endpoint: string, statusCode: number, duration: number, payload: Record<string, any> = {}): void {
    this.info('api_call', `${method} ${endpoint}`, payload, {
      endpoint,
      method,
      statusCode,
      duration
    });
  }

  logBusinessEvent(event: string, entityType: string, entityId: string, payload: Record<string, any> = {}): void {
    this.info('business_event', `${event} ${entityType}`, {
      entityType,
      entityId,
      event,
      ...payload
    });
  }

  logPerformance(operation: string, duration: number, payload: Record<string, any> = {}): void {
    this.info('performance', `Operation ${operation} completed`, payload, {
      operation,
      duration
    });
  }

  logSecurity(event: string, message: string, payload: Record<string, any> = {}): void {
    this.warn('security', message, {
      event,
      ...payload
    });
  }

  logUserAction(action: string, payload: Record<string, any> = {}): void {
    this.info('user_action', `User performed ${action}`, {
      action,
      ...payload
    });
  }
}

// Instância singleton do logger
const logger = new StructuredLogger();

// Funções de conveniência para uso direto
export const logInfo = (event: string, message: string, payload?: Record<string, any>, metadata?: Partial<LogEntry['metadata']>) => 
  logger.info(event, message, payload, metadata);

export const logError = (event: string, message: string, error?: Error, payload?: Record<string, any>, metadata?: Partial<LogEntry['metadata']>) => 
  logger.error(event, message, error, payload, metadata);

export const logWarn = (event: string, message: string, payload?: Record<string, any>, metadata?: Partial<LogEntry['metadata']>) => 
  logger.warn(event, message, payload, metadata);

export const logDebug = (event: string, message: string, payload?: Record<string, any>, metadata?: Partial<LogEntry['metadata']>) => 
  logger.debug(event, message, payload, metadata);

export const logApiCall = (method: string, endpoint: string, statusCode: number, duration: number, payload?: Record<string, any>) => 
  logger.logApiCall(method, endpoint, statusCode, duration, payload);

export const logBusinessEvent = (event: string, entityType: string, entityId: string, payload?: Record<string, any>) => 
  logger.logBusinessEvent(event, entityType, entityId, payload);

export const logPerformance = (operation: string, duration: number, payload?: Record<string, any>) => 
  logger.logPerformance(operation, duration, payload);

export const logSecurity = (event: string, message: string, payload?: Record<string, any>) => 
  logger.logSecurity(event, message, payload);

export const logUserAction = (action: string, payload?: Record<string, any>) => 
  logger.logUserAction(action, payload);

export const setLogContext = (context: Partial<LogContext>) => logger.setContext(context);
export const clearLogContext = () => logger.clearContext();

export default logger;
