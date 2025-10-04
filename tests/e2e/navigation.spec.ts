/**
 * Testes E2E para navegação
 */

import { test, expect, loginAsAdmin, navigateToPage, expectPageLoaded } from './setup';

test.describe('Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('deve navegar para todas as páginas principais', async ({ page }) => {
    const pages = [
      { name: 'dashboard', title: 'Dashboard' },
      { name: 'empresas', title: 'Empresas' },
      { name: 'clientes', title: 'Clientes' },
      { name: 'projetos', title: 'Projetos' },
      { name: 'documentos', title: 'Documentos' },
      { name: 'orcamentos', title: 'Orçamentos' },
      { name: 'status-projetos', title: 'Status de Projetos' },
      { name: 'categorias-documentos', title: 'Categorias de Documentos' },
      { name: 'produtos-servicos', title: 'Produtos e Serviços' },
      { name: 'fornecedores', title: 'Fornecedores' }
    ];

    for (const pageInfo of pages) {
      await navigateToPage(page, pageInfo.name);
      await expectPageLoaded(page, pageInfo.title);
    }
  });

  test('deve mostrar breadcrumbs corretos', async ({ page }) => {
    await navigateToPage(page, 'projetos');
    
    // Verificar se breadcrumbs estão presentes
    await expect(page.locator('[data-testid="breadcrumbs"]')).toBeVisible();
    await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText('Projetos');
  });

  test('deve alternar entre visualizações (lista/kanban)', async ({ page }) => {
    await navigateToPage(page, 'projetos');
    
    // Verificar se toggle de visualização está presente
    await expect(page.locator('[data-testid="view-toggle"]')).toBeVisible();
    
    // Alternar para Kanban
    await page.click('[data-testid="kanban-view"]');
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
    
    // Alternar para Lista
    await page.click('[data-testid="list-view"]');
    await expect(page.locator('[data-testid="data-table"]')).toBeVisible();
  });
});
