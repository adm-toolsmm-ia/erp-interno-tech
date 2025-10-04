import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aplicar apenas para rotas da API
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Health check não precisa de autenticação
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  // Verificar headers obrigatórios para APIs
  const internalKey = request.headers.get('x-internal-key');
  const tenantId = request.headers.get('x-tenant-id');

  // Verificar chave interna
  if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { 
        error: 'Acesso negado', 
        message: 'Chave interna inválida' 
      }, 
      { status: 401 }
    );
  }

  // Verificar tenant ID
  if (!tenantId) {
    return NextResponse.json(
      { 
        error: 'Tenant ID obrigatório', 
        message: 'Header x-tenant-id é obrigatório' 
      }, 
      { status: 400 }
    );
  }

  // Validar formato do tenant ID (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tenantId)) {
    return NextResponse.json(
      { 
        error: 'Tenant ID inválido', 
        message: 'Formato de UUID inválido' 
      }, 
      { status: 400 }
    );
  }

  // Adicionar headers de segurança
  const response = NextResponse.next();
  
  // Headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS para APIs internas
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  
  // Em produção, ALLOWED_ORIGINS deve estar configurado
  if (process.env.NODE_ENV === 'production' && !allowedOrigins) {
    return NextResponse.json(
      { 
        error: 'Configuração de segurança inválida', 
        message: 'ALLOWED_ORIGINS deve estar configurado em produção' 
      }, 
      { status: 500 }
    );
  }
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigins || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-tenant-id');

  return response;
}

export const config = {
  matcher: [
    "/api/((?!health).*)",
  ],
};