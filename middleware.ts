import { NextRequest, NextResponse } from 'next/server';
import { logError, logWarn } from './src/lib/logger';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aplicar apenas para rotas da API
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Health check não precisa de autenticação
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  const context = {
    tenantId: request.headers.get('x-tenant-id') || 'unknown',
    requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
  };

  try {
    // 1. Validar chave interna
    const internalKey = request.headers.get('x-internal-key');
    if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
      logWarn('Tentativa de acesso sem chave interna', context, {
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        pathname,
      });

      return NextResponse.json(
        { error: 'Acesso negado - chave interna inválida' },
        { status: 401 }
      );
    }

    // 2. Validar tenant ID
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      logWarn('Tentativa de acesso sem tenant ID', context, {
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        pathname,
      });

      return NextResponse.json(
        { error: 'Header x-tenant-id é obrigatório' },
        { status: 400 }
      );
    }

    // 3. Validar formato do tenant ID (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      logWarn('Tenant ID com formato inválido', context, {
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        pathname,
        tenantId,
      });

      return NextResponse.json(
        { error: 'Formato de tenant ID inválido' },
        { status: 400 }
      );
    }

    // 4. Headers de segurança
    const response = NextResponse.next();
    
    // CORS restritivo
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id, x-internal-key, x-request-id, x-correlation-id');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Headers de segurança
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 5. Rate limiting básico (por IP)
    const ip = request.ip || 'unknown';
    const rateLimitKey = `rate_limit:${ip}`;
    
    // TODO: Implementar rate limiting com Redis em produção
    // Por enquanto, apenas logar requisições suspeitas
    
    return response;

  } catch (error) {
    logError('Erro no middleware de segurança', error as Error, context, {
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      pathname,
    });

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/((?!health).*)',
  ],
};
