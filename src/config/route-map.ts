/**
 * Mapa de rotas canônico do ERP
 * Derivado de docs/01-modulos.md e navigation.ts
 */

import { routeMap } from './navigation';

export { routeMap };

// Função para validar se uma rota existe no mapa
export function isValidRoute(path: string): boolean {
  // Converte rotas dinâmicas para padrões
  const normalizedPath = path.replace(/\[([^\]]+)\]/g, '[id]');
  return routeMap.includes(normalizedPath as any);
}

// Função para obter todas as rotas estáticas (sem parâmetros)
export function getStaticRoutes(): string[] {
  return routeMap.filter(route => !route.includes('['));
}

// Função para obter rotas dinâmicas por padrão
export function getDynamicRoutes(pattern: string): string[] {
  return routeMap.filter(route => route.includes(pattern));
}

// Função para validar se uma entidade tem Kanban
export function hasKanbanView(entity: string): boolean {
  const entitiesWithKanban = ['projetos', 'orcamentos'];
  return entitiesWithKanban.includes(entity);
}

// Função para validar se uma entidade tem status
export function hasStatusField(entity: string): boolean {
  const entitiesWithStatus = ['projetos', 'orcamentos'];
  return entitiesWithStatus.includes(entity);
}
