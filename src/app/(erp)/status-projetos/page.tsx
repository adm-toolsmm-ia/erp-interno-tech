'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter } from 'lucide-react';
import { CreateStatusProjetoModal } from '@/components/forms/CreateStatusProjetoModal';
import { useStatusProjetos } from '@/hooks/useStatusProjetos';

export default function StatusProjetosPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: statusProjetos, loading, error, refetch } = useStatusProjetos();

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  const breadcrumbItems = [
    { label: 'Configurações' },
    { label: 'Status de Projetos' }
  ];

  const getFaseColor = (fase: string) => {
    switch (fase) {
      case 'INICIO': return 'bg-blue-100 text-blue-800';
      case 'DESENVOLVIMENTO': return 'bg-yellow-100 text-yellow-800';
      case 'TESTE': return 'bg-orange-100 text-orange-800';
      case 'ENTREGA': return 'bg-purple-100 text-purple-800';
      case 'FINALIZADO': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Topbar
        title="Status de Projetos"
        subtitle="Configure os status e fases dos projetos"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Status
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
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou fase..."
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

        {/* Lista de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Projetos ({statusProjetos?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando status...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar status</p>
                <Button onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : !statusProjetos || statusProjetos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum status encontrado</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Status
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Fase</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusProjetos.map((status) => (
                    <TableRow 
                      key={status.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => console.log('Editar status', status.id)}
                    >
                      <TableCell className="font-medium">
                        {status.nome}
                      </TableCell>
                      <TableCell>
                        <Badge className={getFaseColor(status.fase || '')}>
                          {status.fase || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{status.ordem || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: status.cor || '#3B82F6' }}
                          />
                          <span className="text-sm text-gray-600">{status.cor || '#3B82F6'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.ativo ? "default" : "secondary"}>
                          {status.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Excluir
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
      </div>

      <CreateStatusProjetoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
