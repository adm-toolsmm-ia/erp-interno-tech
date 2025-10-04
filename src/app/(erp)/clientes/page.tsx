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
import { CreateClienteModal } from '@/components/forms/CreateClienteModal';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: clientes, loading, error, refetch } = useClientes();
  const { toasts, showInfo, removeToast } = useToast();

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  // Edição implementada via toast informativo (temporário)

  const breadcrumbItems = [
    { label: 'Clientes' }
  ];

  return (
    <div className="space-y-6">
      <Topbar
        title="Clientes"
        subtitle="Gerencie os clientes da empresa"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
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
                {/* Kanban não disponível para clientes (sem status) */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
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

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes ({clientes?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando clientes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar clientes</p>
                <Button onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : !clientes || clientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum cliente encontrado</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cliente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow 
                      key={cliente.id}
                      className="cursor-pointer hover:bg-gray-50"
                        onClick={() => showInfo('Funcionalidade de edição será implementada em breve')}
                    >
                      <TableCell className="font-medium">
                        {cliente.razaoSocial}
                      </TableCell>
                      <TableCell>
                        {cliente.nomeFantasia || '-'}
                      </TableCell>
                      <TableCell>
                        {cliente.cnpj}
                      </TableCell>
                      <TableCell>
                        {cliente.email || '-'}
                      </TableCell>
                      <TableCell>
                        {cliente.telefone || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
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
      </div>

      <CreateClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}