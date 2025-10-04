import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aplicar apenas para rotas da API
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Health check nÃ£o precisa de autenticaÃ§Ã£o
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  // Por enquanto, apenas permitir todas as requisiÃ§Ãµes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/((?!health).*)",
  ],
};
