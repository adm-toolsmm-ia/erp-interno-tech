/**
 * Testes E2E para autenticação
 */

import { test, expect, loginAsAdmin } from './setup';

test.describe('Autenticação', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar se a página de login carregou
    await expect(page.locator('h1, h2')).toContainText('Login');
    
    // Preencher formulário de login
    await page.fill('[data-testid="email"]', 'admin@erp.com');
    await page.fill('[data-testid="password"]', 'admin123');
    
    // Submeter formulário
    await page.click('[data-testid="login-button"]');
    
    // Verificar redirecionamento para dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1, h2')).toContainText('Dashboard');
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher com credenciais inválidas
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    
    // Submeter formulário
    await page.click('[data-testid="login-button"]');
    
    // Verificar se erro é exibido
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Credenciais inválidas');
  });

  test('deve redirecionar para login se não autenticado', async ({ page }) => {
    // Tentar acessar página protegida sem login
    await page.goto('/projetos');
    
    // Deve ser redirecionado para login
    await page.waitForURL('/login');
    await expect(page.locator('h1, h2')).toContainText('Login');
  });
});
