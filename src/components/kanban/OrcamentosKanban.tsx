'use client';

import { useState } from 'react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { KanbanBoard, KanbanColumn, KanbanCard } from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, DollarSign, MoreHorizontal, Plus, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Orcamento {
  id: string;
  numero: string;
  assunto: string;
  status: string;
  clienteId?: string;
  projetoId?: string;
  dataValidade?: string;
  valorTotal?: number;
  moeda?: string;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    id: string;
    razaoSocial: string;
  };
  projeto?: {
    id: string;
    assunto: string;
  };
}

const STATUS_COLUMNS = [
  { id: 'rascunho', nome: 'Rascunho', cor: 'gray' },
  { id: 'enviado', nome: 'Enviado', cor: 'blue' },
  { id: 'em_analise', nome: 'Em Análise', cor: 'yellow' },
  { id: 'aprovado', nome: 'Aprovado', cor: 'green' },
  { id: 'rejeitado', nome: 'Rejeitado', cor: 'red' },
];

export function OrcamentosKanban() {
  const { data: orcamentos, loading, error, refetch } = useOrcamentos();
  const { updateOrcamento } = useApi();
  const { showSuccess, showError } = useToast();

  const [draggedOrcamento, setDraggedOrcamento] = useState<Orcamento | null>(null);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
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

  if (!orcamentos || orcamentos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
          <p className="text-sm text-gray-500 mb-4">Crie um orçamento para começar a usar o Kanban.</p>
          <Button>+ Novo Orçamento</Button>
        </div>
      </div>
    );
  }

  // Agrupar orçamentos por status
  const orcamentosPorStatus = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status.id] = orcamentos.filter(orcamento => orcamento.status === status.id);
    return acc;
  }, {} as Record<string, Orcamento[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'enviado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_analise': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho': return '📝';
      case 'enviado': return '📤';
      case 'em_analise': return '👀';
      case 'aprovado': return '✅';
      case 'rejeitado': return '❌';
      default: return '📄';
    }
  };

  const handleDragStart = (orcamento: Orcamento) => {
    setDraggedOrcamento(orcamento);
  };

  const handleDragEnd = async (orcamento: Orcamento, novoStatus: string) => {
    if (orcamento.status === novoStatus) return;

    try {
      await updateOrcamento(orcamento.id, { status: novoStatus });
      showSuccess(`Orçamento "${orcamento.assunto}" movido para ${STATUS_COLUMNS.find(s => s.id === novoStatus)?.nome}!`);
      refetch();
    } catch (error) {
      console.error('Erro ao mover orçamento:', error);
      showError('Erro ao mover orçamento');
    } finally {
      setDraggedOrcamento(null);
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

  const getDaysUntilExpiry = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderOrcamentoCard = (orcamento: Orcamento) => {
    const daysUntilExpiry = getDaysUntilExpiry(orcamento.dataValidade);
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;

    return (
      <KanbanCard
        key={orcamento.id}
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isExpired ? 'border-red-200 bg-red-50' : 
          isExpiringSoon ? 'border-orange-200 bg-orange-50' : ''
        }`}
        onDragStart={() => handleDragStart(orcamento)}
        onDragEnd={() => setDraggedOrcamento(null)}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500">
                    #{orcamento.numero}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(orcamento.status)}`}
                  >
                    {getStatusIcon(orcamento.status)} {STATUS_COLUMNS.find(s => s.id === orcamento.status)?.nome}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                  {orcamento.assunto}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Editar Orçamento</DropdownMenuItem>
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
            {/* Cliente */}
            {orcamento.cliente && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600 truncate">
                  {orcamento.cliente.razaoSocial}
                </span>
              </div>
            )}

            {/* Projeto */}
            {orcamento.projeto && (
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600 truncate">
                  {orcamento.projeto.assunto}
                </span>
              </div>
            )}

            {/* Valor */}
            {orcamento.valorTotal && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600 font-medium">
                  {formatCurrency(orcamento.valorTotal, orcamento.moeda)}
                </span>
              </div>
            )}

            {/* Data de Validade */}
            {orcamento.dataValidade && (
              <div className="flex items-center gap-2">
                <Clock className={`h-3 w-3 ${
                  isExpired ? 'text-red-500' : 
                  isExpiringSoon ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <span className={`text-xs ${
                  isExpired ? 'text-red-600 font-medium' : 
                  isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-600'
                }`}>
                  Válido até: {formatDate(orcamento.dataValidade)}
                  {daysUntilExpiry !== null && (
                    <span className="ml-1">
                      ({isExpired ? `Expirado há ${Math.abs(daysUntilExpiry)} dias` : 
                        isExpiringSoon ? `${daysUntilExpiry} dias` : `${daysUntilExpiry} dias`})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Data de Criação */}
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                Criado: {formatDate(orcamento.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </KanbanCard>
    );
  };

  return (
    <KanbanBoard>
      {STATUS_COLUMNS.map((status) => (
        <KanbanColumn
          key={status.id}
          title={status.nome}
          count={orcamentosPorStatus[status.id]?.length || 0}
          className="min-w-80"
          onDrop={(orcamento) => handleDragEnd(orcamento, status.id)}
        >
          {orcamentosPorStatus[status.id]?.map(renderOrcamentoCard)}
          
          {/* Botão para adicionar orçamento nesta coluna */}
          <Button 
            variant="ghost" 
            className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-gray-400"
            onClick={() => {
              showInfo(`Funcionalidade de criação de orçamento para status '${status.nome}' será implementada em breve`);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Orçamento
          </Button>
        </KanbanColumn>
      ))}
    </KanbanBoard>
  );
}
