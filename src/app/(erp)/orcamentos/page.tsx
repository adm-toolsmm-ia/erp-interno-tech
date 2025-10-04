'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, List, Kanban } from 'lucide-react';
import { CreateOrcamentoModal } from '@/components/forms/CreateOrcamentoModal';
import { OrcamentosKanban } from '@/components/kanban/OrcamentosKanban';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';

export default function OrcamentosPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: orcamentos, loading, error, refetch } = useOrcamentos();
  const { toasts, showInfo, removeToast } = useToast();

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  const breadcrumbItems = [
    { label: 'Orçamentos' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADO': return 'bg-green-100 text-green-800';
      case 'ENVIADO': return 'bg-blue-100 text-blue-800';
      case 'REJEITADO': return 'bg-red-100 text-red-800';
      case 'CANCELADO': return 'bg-gray-100 text-gray-800';
      case 'RASCUNHO': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Topbar
        title="Orçamentos"
        subtitle="Gerencie os orçamentos dos projetos"
        actions={
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={view === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('kanban')}
                className="rounded-l-none"
              >
                <Kanban className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        }
      />

      <div className="px-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="px-6 space-y-4">
        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título ou projeto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Orçamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos ({orcamentos?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando orçamentos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar orçamentos</p>
                <Button onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : !orcamentos || orcamentos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum orçamento encontrado</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Validade</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentos.map((orcamento) => (
                    <TableRow 
                      key={orcamento.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => showInfo('Funcionalidade de edição será implementada em breve')}
                    >
                      <TableCell className="font-medium">
                        {orcamento.titulo}
                      </TableCell>
                      <TableCell>
                        {orcamento.projeto?.assunto || '-'}
                      </TableCell>
                      <TableCell>
                        {orcamento.valorTotal ? (
                          <span className="font-medium text-green-600">
                            {orcamento.moeda} {orcamento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(orcamento.status)}>
                          {orcamento.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {orcamento.dataValidade ? new Date(orcamento.dataValidade).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                showInfo('Funcionalidade de edição será implementada em breve');
                              }}
                            >
                              Editar
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Visualização Kanban */}
        {view === 'kanban' && (
          <Card>
            <CardHeader>
              <CardTitle>Kanban de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <OrcamentosKanban />
            </CardContent>
          </Card>
        )}
      </div>

      <CreateOrcamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
