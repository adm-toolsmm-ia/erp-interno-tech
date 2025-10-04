import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations';
import { AppError, handleError } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';

// Schema para Categoria de Documento
const createCategoriaDocumentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido (ex: #FF0000)').optional(),
  ordem: z.number().int().min(0).optional(),
});

const updateCategoriaDocumentoSchema = createCategoriaDocumentoSchema.partial();

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

    const { page, limit, sortBy = 'ordem', sortOrder } = paginationParams;
    const skip = (page - 1) * limit;
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { ordem: 'asc' as const };

    // Filtros
    const search = searchParams.get('search');
    const where = {
      empresaId: context.empresaId,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' as const } },
          { descricao: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [categoriasDocumentos, total] = await Promise.all([
      prisma.categoriaDocumento.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              documentos: true,
            },
          },
        },
      }),
      prisma.categoriaDocumento.count({ where }),
    ]);

    logInfo('Categorias de documentos listadas', context, {
      total,
      page,
      limit,
      filters: { search },
    });

    return createSuccessResponse(
      categoriasDocumentos,
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
    logError('Erro ao listar categorias de documentos', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createCategoriaDocumentoSchema.parse(body);

    // Verificar se nome já existe na empresa
    const existingCategoria = await prisma.categoriaDocumento.findFirst({
      where: {
        empresaId: context.empresaId,
        nome: validatedData.nome,
      },
    });

    if (existingCategoria) {
      throw new AppError('Nome de categoria já existe', 409, 'CATEGORY_NAME_EXISTS');
    }

    const categoriaDocumento = await prisma.categoriaDocumento.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
      },
    });

    logInfo('Categoria de documento criada', context, {
      categoriaId: categoriaDocumento.id,
      nome: categoriaDocumento.nome,
      descricao: categoriaDocumento.descricao,
    });

    return createSuccessResponse(categoriaDocumento, context);

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
    logError('Erro ao criar categoria de documento', appError, context);
    return createErrorResponse(appError, context);
  }
}
