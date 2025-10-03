interface LogContext {
  empresaId: string;
  requestId: string;
  userId?: string;
  correlationId?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context: LogContext;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export function logInfo(message: string, context: LogContext, data?: Record<string, any>): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    context,
    data,
  };
  
  console.log(JSON.stringify(logEntry));
}

export function logError(message: string, error: Error, context: LogContext, data?: Record<string, any>): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    context,
    data,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  };
  
  console.error(JSON.stringify(logEntry));
}

export function logWarn(message: string, context: LogContext, data?: Record<string, any>): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    context,
    data,
  };
  
  console.warn(JSON.stringify(logEntry));
}

export function logDebug(message: string, context: LogContext, data?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
      data,
    };
    
    console.debug(JSON.stringify(logEntry));
  }
}
