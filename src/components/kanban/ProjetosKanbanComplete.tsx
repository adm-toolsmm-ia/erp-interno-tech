'use client';

import { useState } from 'react';
import { useProjetos } from '@/hooks/useProjetos';
import { useStatusProjetos } from '@/hooks/useStatusProjetos';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { KanbanBoard, KanbanColumn, KanbanCard } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, DollarSign, MoreHorizontal, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditProjetoDrawer } from '@/components/drawers/EditProjetoDrawer';
import { useEditModal } from '@/hooks/useEditModal';

interface Projeto {
  id: string;
  assunto: string;
  descricao?: string;
  statusId?: string;
  clienteId?: string;
  dataInicio?: string;
  dataFim?: string;
  valorTotal?: number;
  moeda?: string;
  prioridade?: string;
  createdAt: string;
  updatedAt: string;
  status?: {
    id: string;
    nome: string;
    cor: string;
  };
  cliente?: {
    id: string;
    razaoSocial: string;
  };
}

export function ProjetosKanbanComplete() {
  const { data: projetos, loading, error, refetch } = useProjetos();
  const { data: statusProjetos } = useStatusProjetos();
  const { updateProjeto } = useApi();
  const { showSuccess, showError } = useToast();
  const { isEditModalOpen, editingId, openEditModal, closeEditModal, handleEditSuccess } = useEditModal({
    entityName: 'projeto',
    onSuccess: refetch
  });

  const [draggedProject, setDraggedProject] = useState<Projeto | null>(null);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
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
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
          <p className="text-sm text-gray-500 mb-4">Crie um projeto para começar a usar o Kanban.</p>
          <Button>+ Novo Projeto</Button>
        </div>
      </div>
    );
  }

  // Agrupar projetos por status
  const projetosPorStatus = statusProjetos?.reduce((acc, status) => {
    acc[status.id] = projetos.filter(projeto => projeto.statusId === status.id);
    return acc;
  }, {} as Record<string, Projeto[]>) || {};

  // Projetos sem status
  const projetosSemStatus = projetos.filter(projeto => !projeto.statusId);

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'URGENTE': return 'bg-red-100 text-red-800 border-red-200';
      case 'ALTA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BAIXA': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (cor?: string) => {
    switch (cor) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDragStart = (projeto: Projeto) => {
    setDraggedProject(projeto);
  };

  const handleDragEnd = async (projeto: Projeto, novoStatusId: string) => {
    if (projeto.statusId === novoStatusId) return;

    try {
      await updateProjeto(projeto.id, { statusId: novoStatusId });
      showSuccess(`Projeto "${projeto.assunto}" movido com sucesso!`);
      refetch();
    } catch (error) {
      console.error('Erro ao mover projeto:', error);
      showError('Erro ao mover projeto');
    } finally {
      setDraggedProject(null);
    }
  };

  const formatCurrency = (valor?: number, moeda?: string) => {
    if (!valor) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda || 'BRL'
    }).format(valor);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntilDeadline = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderProjectCard = (projeto: Projeto) => {
    const daysUntilDeadline = getDaysUntilDeadline(projeto.dataFim);
    const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
    const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

    return (
      <KanbanCard
        key={projeto.id}
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isOverdue ? 'border-red-200 bg-red-50' : 
          isUrgent ? 'border-orange-200 bg-orange-50' : ''
        }`}
        onDragStart={() => handleDragStart(projeto)}
        onDragEnd={() => setDraggedProject(null)}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                  {projeto.assunto}
                </CardTitle>
                {projeto.descricao && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {projeto.descricao}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditModal(projeto.id)}>
                    Editar Projeto
                  </DropdownMenuItem>
                  <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Prioridade */}
            {projeto.prioridade && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getPrioridadeColor(projeto.prioridade)}`}
              >
                {projeto.prioridade}
              </Badge>
            )}

            {/* Cliente */}
            {projeto.cliente && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600 truncate">
                  {projeto.cliente.razaoSocial}
                </span>
              </div>
            )}

            {/* Valor */}
            {projeto.valorTotal && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {formatCurrency(projeto.valorTotal, projeto.moeda)}
                </span>
              </div>
            )}

            {/* Datas */}
            <div className="space-y-1">
              {projeto.dataInicio && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Início: {formatDate(projeto.dataInicio)}
                  </span>
                </div>
              )}
              
              {projeto.dataFim && (
                <div className="flex items-center gap-2">
                  <Clock className={`h-3 w-3 ${
                    isOverdue ? 'text-red-500' : 
                    isUrgent ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs ${
                    isOverdue ? 'text-red-600 font-medium' : 
                    isUrgent ? 'text-orange-600 font-medium' : 'text-gray-600'
                  }`}>
                    Prazo: {formatDate(projeto.dataFim)}
                    {daysUntilDeadline !== null && (
                      <span className="ml-1">
                        ({isOverdue ? `${Math.abs(daysUntilDeadline)} dias atrasado` : 
                          isUrgent ? `${daysUntilDeadline} dias` : `${daysUntilDeadline} dias`})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Progresso</span>
                <span className="text-xs text-gray-600">33%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    isOverdue ? 'bg-red-500' : 
                    isUrgent ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: '33%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </KanbanCard>
    );
  };

  return (
    <>
      <KanbanBoard>
        {/* Colunas de Status */}
        {statusProjetos?.map((status) => (
          <KanbanColumn
            key={status.id}
            title={status.nome}
            count={projetosPorStatus[status.id]?.length || 0}
            className="min-w-80"
            onDrop={(projeto) => handleDragEnd(projeto, status.id)}
          >
            {projetosPorStatus[status.id]?.map(renderProjectCard)}
            
            {/* Botão para adicionar projeto nesta coluna */}
            <Button 
              variant="ghost" 
              className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-gray-400"
              onClick={() => {
                showInfo(`Funcionalidade de criação de projeto para status '${status.nome}' será implementada em breve`);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Projeto
            </Button>
          </KanbanColumn>
        ))}

        {/* Coluna para projetos sem status */}
        {projetosSemStatus.length > 0 && (
          <KanbanColumn
            title="Sem Status"
            count={projetosSemStatus.length}
            className="min-w-80"
          >
            {projetosSemStatus.map(renderProjectCard)}
          </KanbanColumn>
        )}
      </KanbanBoard>

      {/* Drawer de edição */}
      <EditProjetoDrawer
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        projetoId={editingId}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
