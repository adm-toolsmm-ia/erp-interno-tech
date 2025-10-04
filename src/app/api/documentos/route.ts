import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createDocumentoSchema, updateDocumentoSchema, paginationSchema, documentoFilterSchema } from '@/lib/validations';
import { AppError, handleError } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';

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

    const filterParams = documentoFilterSchema.parse({
      projetoId: searchParams.get('projetoId'),
      clienteId: searchParams.get('clienteId'),
      categoriaId: searchParams.get('categoriaId'),
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
      ...(filterParams.projetoId && { projetoId: filterParams.projetoId }),
      ...(filterParams.clienteId && { clienteId: filterParams.clienteId }),
      ...(filterParams.categoriaId && { categoriaId: filterParams.categoriaId }),
      ...(search && {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' as const } },
          { descricao: { contains: search, mode: 'insensitive' as const } },
          { tags: { has: search } },
        ],
      }),
    };

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          projeto: {
            select: {
              id: true,
              assunto: true,
              cliente: {
                select: {
                  id: true,
                  razaoSocial: true,
                  nomeFantasia: true,
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
              descricao: true,
              cor: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          versoes: {
            select: {
              id: true,
              numero: true,
              createdAt: true,
              sizeBytes: true,
              contentType: true,
            },
            orderBy: {
              numero: 'desc' as const,
            },
          },
          _count: {
            select: {
              versoes: true,
            },
          },
        },
      }),
      prisma.documento.count({ where }),
    ]);

    logInfo('Documentos listados', context, {
      total,
      page,
      limit,
      filters: { 
        search, 
        projetoId: filterParams.projetoId,
        clienteId: filterParams.clienteId,
        categoriaId: filterParams.categoriaId,
      },
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

    // Verificar se projeto existe (se fornecido)
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

    // Verificar se cliente existe (se fornecido)
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
        throw new AppError('Categoria de documento não encontrada', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Criar documento
    const documento = await prisma.documento.create({
      data: {
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        categoriaId: validatedData.categoriaId || null,
        projetoId: validatedData.projetoId || null,
        clienteId: validatedData.clienteId || null,
        storageKey: validatedData.storageKey,
        contentType: validatedData.contentType,
        sizeBytes: validatedData.sizeBytes,
        checksum: validatedData.checksum || null,
        storageProvider: validatedData.storageProvider || null,
        metadata: validatedData.metadata || undefined,
        tags: validatedData.tags || [],
        empresaId: context.empresaId,
        createdById: context.userId, // TODO: Implementar autenticação
      },
    });

    // Criar primeira versão do documento
    const primeiraVersao = await prisma.documentoVersao.create({
      data: {
        documentoId: documento.id,
        numero: 1,
        storageKey: validatedData.storageKey,
        contentType: validatedData.contentType,
        sizeBytes: validatedData.sizeBytes,
        checksum: validatedData.checksum,
        createdById: context.userId, // TODO: Implementar autenticação
      },
    });

    // Buscar documento com relacionamentos
    const documentoCompleto = await prisma.documento.findUnique({
      where: { id: documento.id },
      include: {
        projeto: {
          select: {
            id: true,
            assunto: true,
            cliente: {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
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
            descricao: true,
            cor: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        versoes: {
          select: {
            id: true,
            numero: true,
            createdAt: true,
            sizeBytes: true,
            contentType: true,
          },
          orderBy: {
            numero: 'desc' as const,
          },
        },
      },
    });

    logInfo('Documento criado', context, {
      documentoId: documento.id,
      titulo: documento.titulo,
      projetoId: documento.projetoId,
      clienteId: documento.clienteId,
      versao: primeiraVersao.numero,
    });

    return createSuccessResponse(documentoCompleto, context);

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
    logError('Erro ao criar documento', appError, context);
    return createErrorResponse(appError, context);
  }
}