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
import { CreateDocumentoModal } from '@/components/forms/CreateDocumentoModal';
import { useDocumentos } from '@/hooks/useDocumentos';

export default function DocumentosPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: documentos, loading, error, refetch } = useDocumentos();

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  const breadcrumbItems = [
    { label: 'Documentos' }
  ];

  return (
    <div className="space-y-6">
      <Topbar
        title="Documentos"
        subtitle="Gerencie os documentos dos projetos"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
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
                  placeholder="Buscar por título, projeto ou categoria..."
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

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({documentos?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando documentos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar documentos</p>
                <Button onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : !documentos || documentos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum documento encontrado</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Documento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((documento) => (
                    <TableRow 
                      key={documento.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => console.log('Editar documento', documento.id)}
                    >
                      <TableCell className="font-medium">
                        {documento.titulo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{documento.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        {documento.projeto?.assunto || '-'}
                      </TableCell>
                      <TableCell>
                        {documento.categoria?.nome || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{documento.versao}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(documento.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                          <Button variant="ghost" size="sm">
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

      <CreateDocumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
