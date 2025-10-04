/**
 * Configuração global para testes E2E
 */

import { test as base, expect } from '@playwright/test';

// Extender o test base com funcionalidades customizadas
export const test = base.extend<{
  // Adicionar helpers customizados se necessário
}>({});

// Configurações globais
test.beforeEach(async ({ page }) => {
  // Configurar viewport
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Configurar timeout padrão
  test.setTimeout(30000);
});

// Helper para login
export async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'admin@erp.com');
  await page.fill('[data-testid="password"]', 'admin123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

// Helper para navegar para uma página
export async function navigateToPage(page: any, pageName: string) {
  const pages = {
    'dashboard': '/dashboard',
    'empresas': '/empresas',
    'clientes': '/clientes',
    'projetos': '/projetos',
    'documentos': '/documentos',
    'orcamentos': '/orcamentos',
    'status-projetos': '/status-projetos',
    'categorias-documentos': '/categorias-documentos',
    'produtos-servicos': '/produtos-servicos',
    'fornecedores': '/fornecedores'
  };
  
  const url = pages[pageName as keyof typeof pages];
  if (!url) {
    throw new Error(`Página desconhecida: ${pageName}`);
  }
  
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

// Helper para verificar se uma página carregou corretamente
export async function expectPageLoaded(page: any, expectedTitle: string) {
  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  await expect(page.locator('h1, h2')).toContainText(expectedTitle);
}

export { expect };
