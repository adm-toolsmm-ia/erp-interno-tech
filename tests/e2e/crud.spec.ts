/**
 * Testes E2E para operações CRUD
 */

import { test, expect, loginAsAdmin, navigateToPage } from './setup';

test.describe('Operações CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('deve criar um novo projeto', async ({ page }) => {
    await navigateToPage(page, 'projetos');
    
    // Clicar no botão "Novo Projeto"
    await page.click('[data-testid="create-projeto-button"]');
    
    // Verificar se modal de criação abriu
    await expect(page.locator('[data-testid="create-projeto-modal"]')).toBeVisible();
    
    // Preencher formulário
    await page.fill('[data-testid="projeto-assunto"]', 'Teste E2E - Novo Projeto');
    await page.fill('[data-testid="projeto-descricao"]', 'Descrição do projeto de teste');
    
    // Submeter formulário
    await page.click('[data-testid="submit-projeto"]');
    
    // Verificar se modal fechou e projeto foi criado
    await expect(page.locator('[data-testid="create-projeto-modal"]')).not.toBeVisible();
    
    // Verificar se toast de sucesso apareceu
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('deve editar um projeto existente', async ({ page }) => {
    await navigateToPage(page, 'projetos');
    
    // Clicar em um projeto na lista (primeiro projeto)
    await page.click('[data-testid="projeto-row"]:first-child');
    
    // Verificar se drawer de edição abriu
    await expect(page.locator('[data-testid="edit-projeto-drawer"]')).toBeVisible();
    
    // Alterar assunto
    await page.fill('[data-testid="projeto-assunto"]', 'Projeto Editado - Teste E2E');
    
    // Salvar alterações
    await page.click('[data-testid="save-projeto"]');
    
    // Verificar se drawer fechou
    await expect(page.locator('[data-testid="edit-projeto-drawer"]')).not.toBeVisible();
    
    // Verificar se toast de sucesso apareceu
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('deve filtrar projetos por status', async ({ page }) => {
    await navigateToPage(page, 'projetos');
    
    // Clicar no filtro de status
    await page.click('[data-testid="status-filter"]');
    
    // Selecionar um status específico
    await page.click('[data-testid="status-option"]:first-child');
    
    // Verificar se filtro foi aplicado
    await expect(page.locator('[data-testid="status-chip"]')).toBeVisible();
  });

  test('deve buscar projetos', async ({ page }) => {
    await navigateToPage(page, 'projetos');
    
    // Preencher campo de busca
    await page.fill('[data-testid="search-input"]', 'teste');
    
    // Verificar se resultados foram filtrados
    await page.waitForTimeout(500); // Aguardar debounce
    await expect(page.locator('[data-testid="projeto-row"]')).toHaveCount.greaterThan(0);
  });
});
