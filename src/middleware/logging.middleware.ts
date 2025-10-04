/**
 * Middleware de logging para APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { logApiCall, logError, logPerformance, setLogContext, clearLogContext } from '@/lib/structured-logger';
import { v4 as uuidv4 } from 'uuid';

export function withLogging(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = request.headers.get('x-request-id') || uuidv4();
    const correlationId = request.headers.get('x-correlation-id') || uuidv4();
    const tenantId = request.headers.get('x-tenant-id') || 'unknown';
    
    // Configurar contexto do logger
    setLogContext({
      tenantId,
      requestId,
      correlationId,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    });

    try {
      // Executar handler
      const response = await handler(request);
      
      // Calcular duração
      const duration = Date.now() - startTime;
      
      // Log da chamada da API
      logApiCall(
        request.method,
        request.nextUrl.pathname,
        response.status,
        duration,
        {
          query: Object.fromEntries(request.nextUrl.searchParams),
          headers: Object.fromEntries(request.headers.entries()),
          responseHeaders: Object.fromEntries(response.headers.entries()),
        }
      );

      // Log de performance se demorou muito
      if (duration > 1000) {
        logPerformance('api_slow_response', duration, {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          statusCode: response.status,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log do erro
      logError(
        'api_error',
        `API call failed: ${request.method} ${request.nextUrl.pathname}`,
        error as Error,
        {
          query: Object.fromEntries(request.nextUrl.searchParams),
          headers: Object.fromEntries(request.headers.entries()),
          duration,
        }
      );

      // Retornar erro 500
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    } finally {
      // Limpar contexto
      clearLogContext();
    }
  };
}

// Middleware para Next.js App Router
export function createLoggedApiRoute(handler: (request: NextRequest) => Promise<NextResponse>) {
  return withLogging(handler);
}
