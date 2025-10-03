import { NextRequest } from 'next/server';

export interface TenantContext {
  empresaId: string;
  requestId: string;
  userId?: string;
  correlationId?: string;
}

export function extractTenantFromRequest(request: NextRequest): TenantContext {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();
  const empresaId = request.headers.get('x-tenant-id');
  const userId = request.headers.get('x-user-id');

  if (!empresaId) {
    throw new Error('Header x-tenant-id é obrigatório');
  }

  return {
    empresaId,
    requestId,
    userId: userId || undefined,
    correlationId,
  };
}

export function validateTenantId(empresaId: string): boolean {
  // Validação básica de UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(empresaId);
}

export function createTenantContext(empresaId: string, requestId?: string): TenantContext {
  return {
    empresaId,
    requestId: requestId || crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
  };
}
