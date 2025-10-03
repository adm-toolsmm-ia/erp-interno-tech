import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createDocumentoSchema, paginationSchema, documentoFilterSchema } from '@/lib/validations';
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

    const filters = documentoFilterSchema.parse({
      projetoId: searchParams.get('projetoId'),
      clienteId: searchParams.get('clienteId'),
      categoriaId: searchParams.get('categoriaId'),
      statusId: searchParams.get('statusId'),
      status: searchParams.get('status'),
      prioridade: searchParams.get('prioridade'),
      segmento: searchParams.get('segmento'),
    });

    const skip = (page - 1) * limit;
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { updatedAt: 'desc' };

    const whereClause = {
      empresaId: context.empresaId,
      deletedAt: null,
      ...(filters.projetoId && { projetoId: filters.projetoId }),
      ...(filters.clienteId && { clienteId: filters.clienteId }),
      ...(filters.categoriaId && { categoriaId: filters.categoriaId }),
      ...(filters.segmento && {
        cliente: {
          segmento: filters.segmento,
        },
      }),
    };

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          projeto: {
            select: {
              id: true,
              assunto: true,
              status: {
                select: {
                  nome: true,
                  fase: true,
                },
              },
            },
          },
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              nome: true,
            },
          },
          _count: {
            select: {
              versoes: true,
            },
          },
        },
      }),
      prisma.documento.count({
        where: whereClause,
      }),
    ]);

    logInfo('Documentos listados', context, {
      total,
      page,
      limit,
      filters,
    });

    return createSuccessResponse(
      documentos,
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
    logError('Erro ao listar documentos', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createDocumentoSchema.parse(body);

    // Verificar se projeto existe e pertence à empresa (se fornecido)
    if (validatedData.projetoId) {
      const projeto = await prisma.projeto.findFirst({
        where: {
          id: validatedData.projetoId,
          empresaId: context.empresaId,
          deletedAt: null,
        },
      });

      if (!projeto) {
        throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND');
      }
    }

    // Verificar se cliente existe e pertence à empresa (se fornecido)
    if (validatedData.clienteId) {
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
    }

    // Verificar se categoria existe (se fornecida)
    if (validatedData.categoriaId) {
      const categoria = await prisma.categoriaDocumento.findFirst({
        where: {
          id: validatedData.categoriaId,
          empresaId: context.empresaId,
        },
      });

      if (!categoria) {
        throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    const documento = await prisma.documento.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
        createdById: context.userId,
        updatedById: context.userId,
      },
      include: {
        projeto: {
          select: {
            id: true,
            assunto: true,
          },
        },
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
        },
      },
    });

    logInfo('Documento criado', context, {
      documentoId: documento.id,
      titulo: documento.titulo,
      projetoId: documento.projetoId,
    });

    return createSuccessResponse(documento, context);

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
    logError('Erro ao criar documento', appError, context);
    return createErrorResponse(appError, context);
  }
}
