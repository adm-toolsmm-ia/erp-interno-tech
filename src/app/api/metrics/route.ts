import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { handleError } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    // Métricas básicas por tenant
    const [
      totalClientes,
      totalProjetos,
      totalDocumentos,
      totalOrcamentos,
      projetosPorStatus,
      orcamentosPorStatus,
    ] = await Promise.all([
      // Total de clientes
      prisma.cliente.count({
        where: {
          empresaId: context.empresaId,
          deletedAt: null,
        },
      }),
      
      // Total de projetos
      prisma.projeto.count({
        where: {
          empresaId: context.empresaId,
          deletedAt: null,
        },
      }),
      
      // Total de documentos
      prisma.documento.count({
        where: {
          empresaId: context.empresaId,
          deletedAt: null,
        },
      }),
      
      // Total de orçamentos
      prisma.orcamento.count({
        where: {
          empresaId: context.empresaId,
          deletedAt: null,
        },
      }),
      
      // Projetos por status
      prisma.projeto.groupBy({
        by: ['statusId'],
        where: {
          empresaId: context.empresaId,
          deletedAt: null,
        },
        _count: {
          id: true,
        },
      }),
      
      // Orçamentos por status
      prisma.orcamento.groupBy({
        by: ['status'],
        where: {
          empresaId: context.empresaId,
          deletedAt: null,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Buscar nomes dos status
    const statusIds = projetosPorStatus.map(p => p.statusId).filter((id): id is string => id !== null);
    const statusProjetos = await prisma.statusProjeto.findMany({
      where: {
        id: { in: statusIds },
        empresaId: context.empresaId,
      },
      select: {
        id: true,
        nome: true,
        fase: true,
        cor: true,
      },
    });

    const statusMap = statusProjetos.reduce((acc, status) => {
      acc[status.id] = status;
      return acc;
    }, {} as Record<string, any>);

    const metrics = {
      overview: {
        totalClientes,
        totalProjetos,
        totalDocumentos,
        totalOrcamentos,
      },
      projetos: {
        porStatus: projetosPorStatus.map(p => ({
          statusId: p.statusId,
          status: p.statusId ? statusMap[p.statusId] : null,
          count: p._count.id,
        })),
      },
      orcamentos: {
        porStatus: orcamentosPorStatus.map(o => ({
          status: o.status,
          count: o._count.id,
        })),
      },
      timestamp: new Date().toISOString(),
    };

    logInfo('Métricas consultadas', context, {
      totalClientes,
      totalProjetos,
      totalDocumentos,
      totalOrcamentos,
    });

    return createSuccessResponse(metrics, context);

  } catch (error) {
    const appError = handleError(error);
    logError('Erro ao consultar métricas', appError, context);
    return createErrorResponse(appError, context);
  }
}
