'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Projeto {
  id: string;
  assunto: string;
  descricao?: string;
  dataEntrada: string;
  dataInicio?: string;
  dataFim?: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  tags: string[];
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
  gerente?: {
    id: string;
    nome: string;
  };
  vendedor?: {
    id: string;
    nome: string;
  };
  _count: {
    documentos: number;
    orcamentos: number;
    atividades: number;
    atas: number;
  };
}

const prioridadeColors = {
  BAIXA: 'bg-gray-100 text-gray-800',
  MEDIA: 'bg-blue-100 text-blue-800',
  ALTA: 'bg-orange-100 text-orange-800',
  URGENTE: 'bg-red-100 text-red-800',
};

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjetos();
  }, []);

  const fetchProjetos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projetos', {
        headers: {
          'x-tenant-id': '12345678-1234-1234-1234-123456789012', // TODO: Pegar do contexto
          'x-internal-key': process.env.NEXT_PUBLIC_INTERNAL_KEY || 'dev-key',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar projetos');
      }

      const data = await response.json();
      setProjetos(data.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjetos = projetos.filter(projeto =>
    projeto.assunto.toLowerCase().includes(search.toLowerCase()) ||
    projeto.cliente.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    projeto.cliente.nomeFantasia?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <Button>Novo Projeto</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjetos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum projeto encontrado</p>
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
                  <TableHead>Responsáveis</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjetos.map((projeto) => (
                  <TableRow key={projeto.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{projeto.assunto}</div>
                        {projeto.descricao && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {projeto.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{projeto.cliente.razaoSocial}</div>
                        {projeto.cliente.nomeFantasia && (
                          <div className="text-sm text-gray-500">{projeto.cliente.nomeFantasia}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {projeto.status ? (
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: projeto.status.cor + '20', color: projeto.status.cor }}
                        >
                          {projeto.status.nome}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={prioridadeColors[projeto.prioridade]}
                      >
                        {projeto.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(projeto.dataEntrada).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {projeto.gerente && (
                          <div className="text-sm">
                            <span className="text-gray-500">Gerente:</span> {projeto.gerente.nome}
                          </div>
                        )}
                        {projeto.vendedor && (
                          <div className="text-sm">
                            <span className="text-gray-500">Vendedor:</span> {projeto.vendedor.nome}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline">{projeto._count.documentos} docs</Badge>
                        <Badge variant="outline">{projeto._count.orcamentos} orç.</Badge>
                        <Badge variant="outline">{projeto._count.atividades} ativ.</Badge>
                      </div>
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
