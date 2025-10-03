import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createEmpresaSchema, paginationSchema } from '@/lib/validations';
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

    const skip = (page - 1) * limit;
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' as const };

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where: {
          id: context.empresaId,
          deletedAt: null,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.empresa.count({
        where: {
          id: context.empresaId,
          deletedAt: null,
        },
      }),
    ]);

    logInfo('Empresas listadas', context, {
      total,
      page,
      limit,
    });

    return createSuccessResponse(
      empresas,
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
    logError('Erro ao listar empresas', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createEmpresaSchema.parse(body);

    // Verificar se CNPJ já existe
    const existingEmpresa = await prisma.empresa.findFirst({
      where: {
        cnpj: validatedData.cnpj,
        deletedAt: null,
      },
    });

    if (existingEmpresa) {
      throw new AppError('CNPJ já cadastrado', 409, 'CNPJ_EXISTS');
    }

    const empresa = await prisma.empresa.create({
      data: {
        ...validatedData,
        id: context.empresaId, // Usar o tenantId como ID da empresa
      },
    });

    logInfo('Empresa criada', context, {
      empresaId: empresa.id,
      cnpj: empresa.cnpj,
    });

    return createSuccessResponse(empresa, context);

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
    logError('Erro ao criar empresa', appError, context);
    return createErrorResponse(appError, context);
  }
}
