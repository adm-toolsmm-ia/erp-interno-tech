'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Metrics {
  overview: {
    totalClientes: number;
    totalProjetos: number;
    totalDocumentos: number;
    totalOrcamentos: number;
  };
  projetos: {
    porStatus: Array<{
      statusId: string | null;
      status: {
        id: string;
        nome: string;
        fase: string;
        cor: string;
      } | null;
      count: number;
    }>;
  };
  orcamentos: {
    porStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  timestamp: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metrics', {
        headers: {
          'x-tenant-id': '12345678-1234-1234-1234-123456789012', // TODO: Pegar do contexto
          'x-internal-key': process.env.NEXT_PUBLIC_INTERNAL_KEY || 'dev-key',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      const data = await response.json();
      setMetrics(data.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-center py-8">
          <p className="text-gray-500">Erro ao carregar métricas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Total de clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalProjetos}</div>
            <p className="text-xs text-muted-foreground">Total de projetos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalDocumentos}</div>
            <p className="text-xs text-muted-foreground">Total de documentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalOrcamentos}</div>
            <p className="text-xs text-muted-foreground">Total de orçamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Projetos por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.projetos.porStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.status && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.status.cor }}
                      />
                    )}
                    <span className="text-sm font-medium">
                      {item.status?.nome || 'Sem Status'}
                    </span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamentos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.orcamentos.porStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {item.status.toLowerCase()}
                  </span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamp */}
      <div className="text-center text-sm text-gray-500">
        Última atualização: {new Date(metrics.timestamp).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
