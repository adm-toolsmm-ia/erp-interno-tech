import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createProjetoSchema, paginationSchema, projetoFilterSchema } from '@/lib/validations';
import { AppError, handleError } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, sortBy, sortOrder } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    const filters = projetoFilterSchema.parse({
      projetoId: searchParams.get('projetoId'),
      clienteId: searchParams.get('clienteId'),
      statusId: searchParams.get('statusId'),
      status: searchParams.get('status'),
      prioridade: searchParams.get('prioridade'),
      segmento: searchParams.get('segmento'),
    });

    const skip = (page - 1) * limit;
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' as const };

    const whereClause = {
      empresaId: context.empresaId,
      deletedAt: null,
      ...(filters.projetoId && { id: filters.projetoId }),
      ...(filters.clienteId && { clienteId: filters.clienteId }),
      ...(filters.statusId && { statusId: filters.statusId }),
      ...(filters.prioridade && { prioridade: filters.prioridade }),
      ...(filters.segmento && {
        cliente: {
          segmento: filters.segmento,
        },
      }),
    };

    const [projetos, total] = await Promise.all([
      prisma.projeto.findMany({
        where: whereClause,
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
      prisma.projeto.count({
        where: whereClause,
      }),
    ]);

    logInfo('Projetos listados', context, {
      total,
      page,
      limit,
      filters,
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
        throw new AppError('Status não encontrado', 404, 'STATUS_NOT_FOUND');
      }
    }

    const projeto = await prisma.projeto.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        status: {
          select: {
            id: true,
            nome: true,
            fase: true,
          },
        },
      },
    });

    logInfo('Projeto criado', context, {
      projetoId: projeto.id,
      clienteId: projeto.clienteId,
      assunto: projeto.assunto,
    });

    return createSuccessResponse(projeto, context);

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any;
      const validationErrors = zodError.errors.reduce((acc: Record<string, string[]>, err: any) => {
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
