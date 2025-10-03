import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createClienteSchema, paginationSchema, clienteFilterSchema } from '@/lib/validations';
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

    const filters = clienteFilterSchema.parse({
      clienteId: searchParams.get('clienteId'),
      segmento: searchParams.get('segmento'),
    });

    const skip = (page - 1) * limit;
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' as const };

    const whereClause = {
      empresaId: context.empresaId,
      deletedAt: null,
      ...(filters.clienteId && { id: filters.clienteId }),
      ...(filters.segmento && { segmento: filters.segmento }),
    };

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          representantes: true,
          setores: true,
          _count: {
            select: {
              projetos: true,
              documentos: true,
            },
          },
        },
      }),
      prisma.cliente.count({
        where: whereClause,
      }),
    ]);

    logInfo('Clientes listados', context, {
      total,
      page,
      limit,
      filters,
    });

    return createSuccessResponse(
      clientes,
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
    logError('Erro ao listar clientes', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createClienteSchema.parse(body);

    // Verificar se CNPJ já existe na empresa
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        empresaId: context.empresaId,
        cnpj: validatedData.cnpj,
        deletedAt: null,
      },
    });

    if (existingCliente) {
      throw new AppError('CNPJ já cadastrado para esta empresa', 409, 'CNPJ_EXISTS');
    }

    const cliente = await prisma.cliente.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
        normalizedCnpj: validatedData.cnpj.replace(/\D/g, ''),
      },
    });

    logInfo('Cliente criado', context, {
      clienteId: cliente.id,
      cnpj: cliente.cnpj,
    });

    return createSuccessResponse(cliente, context);

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
    logError('Erro ao criar cliente', appError, context);
    return createErrorResponse(appError, context);
  }
}
