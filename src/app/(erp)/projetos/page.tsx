'use client';

import { useState } from 'react';
import { Plus, Search, Filter, List, Kanban } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateProjetoModal } from '@/components/forms/CreateProjetoModal';
import { useProjetos } from '@/hooks/useProjetos';
import { ProjetosKanban } from '@/components/kanban/ProjetosKanban';

interface Projeto {
  id: string;
  assunto: string;
  descricao?: string;
  dataEntrada: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  cliente: {
    id: string;
    razaoSocial: string;
    nomeFantasia?: string;
  };
  status?: {
    id: string;
    nome: string;
    fase?: string;
    cor?: string;
  };
  _count: {
    documentos: number;
    orcamentos: number;
    atividades: number;
    atas: number;
  };
}

export default function ProjetosPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: projetos, loading, error, refetch } = useProjetos();
  const { isEditModalOpen, editingId, openEditModal, closeEditModal, handleEditSuccess } = useEditModal({
    entityName: 'projeto',
    onSuccess: refetch
  });

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  // Edição implementada via modal
  // Kanban implementado (componente ProjetosKanban)

  const breadcrumbItems = [
    { label: 'Projetos' }
  ];

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
    <div className="space-y-6">
      <Topbar
        title="Projetos"
        subtitle="Gerencie os projetos da empresa"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        }
      />

      <div className="px-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="px-6 space-y-4">
        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </Button>
                <Button
                  variant={view === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('kanban')}
                >
                  <Kanban className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por assunto, descrição ou cliente..."
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

        {/* Lista ou Kanban de Projetos */}
        {view === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>Projetos ({projetos?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Carregando projetos...</p>
                </div>
              ) : !projetos || projetos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhum projeto encontrado</p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data Entrada</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead>Orçamentos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projetos.map((projeto) => (
                      <TableRow 
                        key={projeto.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => openEditModal(projeto.id)}
                      >
                        <TableCell className="font-medium">
                          {projeto.assunto}
                        </TableCell>
                        <TableCell>
                          {projeto.cliente?.razaoSocial || '-'}
                        </TableCell>
                        <TableCell>
                          {projeto.status ? (
                            <Badge 
                              variant="secondary"
                              style={{ backgroundColor: projeto.status.cor || '#6B7280' }}
                            >
                              {projeto.status.nome}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadeColor(projeto.prioridade)}>
                            {projeto.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(projeto.dataEntrada).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{projeto._count?.documentos || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{projeto._count?.orcamentos || 0}</Badge>
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
                                openEditModal(projeto.id);
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Kanban de Projetos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjetosKanban />
            </CardContent>
          </Card>
        )}
      </div>

      <CreateProjetoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditProjetoModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        projetoId={editingId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}