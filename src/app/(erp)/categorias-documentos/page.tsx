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
import { CreateCategoriaDocumentoModal } from '@/components/forms/CreateCategoriaDocumentoModal';
import { useCategoriasDocumentos } from '@/hooks/useCategoriasDocumentos';

export default function CategoriasDocumentosPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: categorias, loading, error, refetch } = useCategoriasDocumentos();

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  const breadcrumbItems = [
    { label: 'Configurações' },
    { label: 'Categorias de Documentos' }
  ];

  return (
    <div className="space-y-6">
      <Topbar
        title="Categorias de Documentos"
        subtitle="Configure as categorias para organização dos documentos"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
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
                  placeholder="Buscar por nome..."
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

        {/* Lista de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias de Documentos ({categorias?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando categorias...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Erro ao carregar categorias</p>
                <Button onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : !categorias || categorias.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma categoria encontrada</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ícone</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((categoria) => (
                    <TableRow 
                      key={categoria.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => console.log('Editar categoria', categoria.id)}
                    >
                      <TableCell className="font-medium">
                        {categoria.nome}
                      </TableCell>
                      <TableCell>
                        {categoria.descricao || '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-2xl">{categoria.icone || '📄'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: categoria.cor || '#3B82F6' }}
                          />
                          <span className="text-sm text-gray-600">{categoria.cor || '#3B82F6'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoria.ativo ? "default" : "secondary"}>
                          {categoria.ativo ? 'Ativo' : 'Inativo'}
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

      <CreateCategoriaDocumentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
