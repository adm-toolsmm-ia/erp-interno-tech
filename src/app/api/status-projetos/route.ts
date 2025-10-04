import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { paginationSchema } from '@/lib/validations';
import { AppError, handleError } from '@/lib/errors';
import { logInfo, logError } from '@/lib/logger';

// Configurar runtime para Node.js (necessário para Prisma)
export const runtime = 'nodejs';

// Schema para Status de Projeto
const createStatusProjetoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  fase: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido (ex: #FF0000)').optional(),
  ordem: z.number().int().min(0).optional(),
});

const updateStatusProjetoSchema = createStatusProjetoSchema.partial();

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
    const fase = searchParams.get('fase');
    const where = {
      empresaId: context.empresaId,
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' as const } },
          { fase: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(fase && { fase }),
    };

    const [statusProjetos, total] = await Promise.all([
      prisma.statusProjeto.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              projetos: true,
            },
          },
        },
      }),
      prisma.statusProjeto.count({ where }),
    ]);

    logInfo('Status de projetos listados', context, {
      total,
      page,
      limit,
      filters: { search, fase },
    });

    return createSuccessResponse(
      statusProjetos,
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
    logError('Erro ao listar status de projetos', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createStatusProjetoSchema.parse(body);

    // Verificar se nome já existe na empresa
    const existingStatus = await prisma.statusProjeto.findFirst({
      where: {
        empresaId: context.empresaId,
        nome: validatedData.nome,
      },
    });

    if (existingStatus) {
      throw new AppError('Nome de status já existe', 409, 'STATUS_NAME_EXISTS');
    }

    const statusProjeto = await prisma.statusProjeto.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
      },
    });

    logInfo('Status de projeto criado', context, {
      statusId: statusProjeto.id,
      nome: statusProjeto.nome,
      fase: statusProjeto.fase,
    });

    return createSuccessResponse(statusProjeto, context);

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
    logError('Erro ao criar status de projeto', appError, context);
    return createErrorResponse(appError, context);
  }
}
