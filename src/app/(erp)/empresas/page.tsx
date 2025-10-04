'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEmpresaModal } from '@/components/forms/CreateEmpresaModal';
import { useEmpresas } from '@/hooks/useEmpresas';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmpresasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: empresas, loading, error, refetch } = useEmpresas();

  const handleSuccess = () => {
    refetch(); // Recarregar lista após criação
  };

  return (
    <>
      <Topbar 
        title="Empresas" 
        actions={
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Nova Empresa
          </Button>
        } 
      />
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Lista de Empresas</h1>
            
            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando empresas...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800 text-sm">{error.error.message}</p>
              </div>
            )}

            {empresas && empresas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>Nome Fantasia</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map((empresa) => (
                      <TableRow key={empresa.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {empresa.razaoSocial}
                        </TableCell>
                        <TableCell>
                          {empresa.nomeFantasia || '-'}
                        </TableCell>
                        <TableCell>
                          {empresa.cnpj}
                        </TableCell>
                        <TableCell>
                          {empresa.email || '-'}
                        </TableCell>
                        <TableCell>
                          {empresa.telefone || '-'}
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
              </div>
            ) : !loading && (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhuma empresa encontrada.</p>
                <p className="text-sm mt-2">Clique em "Nova Empresa" para começar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateEmpresaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
