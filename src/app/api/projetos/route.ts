import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createProjetoSchema, updateProjetoSchema, paginationSchema, projetoFilterSchema } from '@/lib/validations';
import { AppError, handleError } from '@/lib/errors';
import { logBusinessEvent, logError } from '@/lib/structured-logger';

// Configurar runtime para Node.js (necessário para Prisma)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Validação de parâmetros
    const paginationParams = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    const filterParams = projetoFilterSchema.parse({
      projetoId: searchParams.get('projetoId'),
      clienteId: searchParams.get('clienteId'),
      statusId: searchParams.get('statusId'),
      status: searchParams.get('status'),
      prioridade: searchParams.get('prioridade'),
      segmento: searchParams.get('segmento'),
    });

    const { page, limit, sortBy = 'createdAt', sortOrder } = paginationParams;
    const skip = (page - 1) * limit;
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' as const };

    // Filtros
    const search = searchParams.get('search');
    const where = {
      empresaId: context.empresaId,
      deletedAt: null,
      ...(filterParams.clienteId && { clienteId: filterParams.clienteId }),
      ...(filterParams.statusId && { statusId: filterParams.statusId }),
      ...(filterParams.prioridade && { prioridade: filterParams.prioridade }),
      ...(filterParams.segmento && {
        cliente: { segmento: filterParams.segmento },
      }),
      ...(search && {
        OR: [
          { assunto: { contains: search, mode: 'insensitive' as const } },
          { descricao: { contains: search, mode: 'insensitive' as const } },
          { observacoes: { contains: search, mode: 'insensitive' as const } },
          { cliente: { razaoSocial: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [projetos, total] = await Promise.all([
      prisma.projeto.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              segmento: true,
            },
          },
          status: {
            select: {
              id: true,
              nome: true,
              fase: true,
              cor: true,
            },
          },
          gerente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          vendedor: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          _count: {
            select: {
              documentos: true,
              orcamentos: true,
              atividades: true,
              atas: true,
            },
          },
        },
      }),
      prisma.projeto.count({ where }),
    ]);

    logInfo('Projetos listados', context, {
      total,
      page,
      limit,
      filters: { 
        search, 
        clienteId: filterParams.clienteId,
        statusId: filterParams.statusId,
        prioridade: filterParams.prioridade,
      },
    });

    return createSuccessResponse(
      projetos,
      context,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );

  } catch (error) {
    const appError = handleError(error);
    logError('Erro ao listar projetos', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createProjetoSchema.parse(body);

    // Verificar se cliente existe e pertence à empresa
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: validatedData.clienteId,
        empresaId: context.empresaId,
        deletedAt: null,
      },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404, 'CLIENT_NOT_FOUND');
    }

    // Verificar se status existe (se fornecido)
    if (validatedData.statusId) {
      const status = await prisma.statusProjeto.findFirst({
        where: {
          id: validatedData.statusId,
          empresaId: context.empresaId,
        },
      });

      if (!status) {
        throw new AppError('Status de projeto não encontrado', 404, 'STATUS_NOT_FOUND');
      }
    }

    // Verificar se gerente existe (se fornecido)
    if (validatedData.gerenteId) {
      const gerente = await prisma.usuario.findFirst({
        where: {
          id: validatedData.gerenteId,
          empresaId: context.empresaId,
          deletedAt: null,
        },
      });

      if (!gerente) {
        throw new AppError('Gerente não encontrado', 404, 'MANAGER_NOT_FOUND');
      }
    }

    // Verificar se vendedor existe (se fornecido)
    if (validatedData.vendedorId) {
      const vendedor = await prisma.usuario.findFirst({
        where: {
          id: validatedData.vendedorId,
          empresaId: context.empresaId,
          deletedAt: null,
        },
      });

      if (!vendedor) {
        throw new AppError('Vendedor não encontrado', 404, 'SELLER_NOT_FOUND');
      }
    }

    const projeto = await prisma.projeto.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
        dataEntrada: new Date(validatedData.dataEntrada),
        dataInicio: validatedData.dataInicio ? new Date(validatedData.dataInicio) : null,
        dataFim: validatedData.dataFim ? new Date(validatedData.dataFim) : null,
      },
    });

    logInfo('Projeto criado', context, {
      projetoId: projeto.id,
      assunto: projeto.assunto,
      clienteId: projeto.clienteId,
      prioridade: projeto.prioridade,
    });

    return createSuccessResponse(projeto, context);

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.reduce((acc: Record<string, string[]>, err) => {
        const field = err.path.join('.');
        if (!acc[field]) acc[field] = [];
        acc[field].push(err.message);
        return acc;
      }, {});
      
      return createValidationErrorResponse(validationErrors, context);
    }

    const appError = handleError(error);
    logError('Erro ao criar projeto', appError, context);
    return createErrorResponse(appError, context);
  }
}