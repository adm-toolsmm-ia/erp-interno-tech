'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  segmento?: string;
  telefone?: string;
  email?: string;
  createdAt: string;
  _count: {
    projetos: number;
    documentos: number;
  };
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clientes', {
        headers: {
          'x-tenant-id': '12345678-1234-1234-1234-123456789012', // TODO: Pegar do contexto
          'x-internal-key': process.env.NEXT_PUBLIC_INTERNAL_KEY || 'dev-key',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }

      const data = await response.json();
      setClientes(data.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    cliente.nomeFantasia?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.cnpj.includes(search)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button>Novo Cliente</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Projetos</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {cliente.razaoSocial}
                    </TableCell>
                    <TableCell>
                      {cliente.nomeFantasia || '-'}
                    </TableCell>
                    <TableCell>
                      {cliente.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                    </TableCell>
                    <TableCell>
                      {cliente.segmento ? (
                        <Badge variant="secondary">{cliente.segmento}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cliente.email && (
                          <div className="text-sm text-gray-600">{cliente.email}</div>
                        )}
                        {cliente.telefone && (
                          <div className="text-sm text-gray-600">{cliente.telefone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cliente._count.projetos}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cliente._count.documentos}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
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
  );
}
