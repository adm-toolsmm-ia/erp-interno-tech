'use client';

import { useProjetos } from '@/hooks/useProjetos';
import { useStatusProjetos } from '@/hooks/useStatusProjetos';
import { KanbanBoard, KanbanColumn, KanbanCard } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge';

export function ProjetosKanban() {
  const { data: projetos, loading, error } = useProjetos();
  const { data: statusProjetos } = useStatusProjetos();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando Kanban...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800 text-sm">{error.error.message}</p>
      </div>
    );
  }

  if (!projetos || projetos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum projeto encontrado.</p>
        <p className="text-sm mt-2">Crie um projeto para ver no Kanban.</p>
      </div>
    );
  }

  // Agrupar projetos por status
  const projetosPorStatus = statusProjetos?.reduce((acc, status) => {
    acc[status.id] = projetos.filter(projeto => projeto.statusId === status.id);
    return acc;
  }, {} as Record<string, typeof projetos>) || {};

  // Projetos sem status
  const projetosSemStatus = projetos.filter(projeto => !projeto.statusId);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE': return 'bg-red-100 text-red-800';
      case 'ALTA': return 'bg-orange-100 text-orange-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAIXA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <KanbanBoard>
      {/* Coluna para projetos sem status */}
      {projetosSemStatus.length > 0 && (
        <KanbanColumn title="Sem Status" count={projetosSemStatus.length}>
          {projetosSemStatus.map((projeto) => (
            <KanbanCard key={projeto.id}>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 truncate">{projeto.assunto}</h4>
                <p className="text-sm text-gray-600 truncate">{projeto.cliente?.razaoSocial}</p>
                <div className="flex items-center justify-between">
                  <Badge className={getPrioridadeColor(projeto.prioridade)}>
                    {projeto.prioridade}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(projeto.dataEntrada).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {projeto.orcamento && (
                  <p className="text-sm font-medium text-green-600">
                    R$ {projeto.orcamento.toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </KanbanCard>
          ))}
        </KanbanColumn>
      )}

      {/* Colunas para cada status */}
      {statusProjetos?.map((status) => {
        const projetosDoStatus = projetosPorStatus[status.id] || [];
        
        return (
          <KanbanColumn key={status.id} title={status.nome} count={projetosDoStatus.length}>
            {projetosDoStatus.map((projeto) => (
              <KanbanCard key={projeto.id}>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 truncate">{projeto.assunto}</h4>
                  <p className="text-sm text-gray-600 truncate">{projeto.cliente?.razaoSocial}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getPrioridadeColor(projeto.prioridade)}>
                      {projeto.prioridade}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(projeto.dataEntrada).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {projeto.orcamento && (
                    <p className="text-sm font-medium text-green-600">
                      R$ {projeto.orcamento.toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </KanbanCard>
            ))}
          </KanbanColumn>
        );
      })}
    </KanbanBoard>
  );
}
