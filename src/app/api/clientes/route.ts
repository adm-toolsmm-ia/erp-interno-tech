import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createClienteSchema, updateClienteSchema, paginationSchema, clienteFilterSchema } from '@/lib/validations';
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

    const filterParams = clienteFilterSchema.parse({
      clienteId: searchParams.get('clienteId'),
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
      ...(filterParams.segmento && { segmento: filterParams.segmento }),
      ...(search && {
        OR: [
          { razaoSocial: { contains: search, mode: 'insensitive' as const } },
          { nomeFantasia: { contains: search, mode: 'insensitive' as const } },
          { cnpj: { contains: search } },
        ],
      }),
    };

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          representantes: true,
          setores: {
            include: {
              coordenador: { select: { id: true, nome: true } },
              gerente: { select: { id: true, nome: true } },
              keyUser: { select: { id: true, nome: true } },
            },
          },
          _count: {
            select: {
              projetos: true,
              documentos: true,
            },
          },
        },
      }),
      prisma.cliente.count({ where }),
    ]);

    logInfo('Clientes listados', context, {
      total,
      page,
      limit,
      filters: { search, segmento: filterParams.segmento },
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

    // Normalizar CNPJ (remover formatação)
    const normalizedCnpj = validatedData.cnpj.replace(/\D/g, '');

    // Verificar se CNPJ já existe na empresa
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        empresaId: context.empresaId,
        normalizedCnpj,
        deletedAt: null,
      },
    });

    if (existingCliente) {
      throw new AppError('CNPJ já cadastrado para esta empresa', 409, 'CNPJ_EXISTS');
    }

    const cliente = await prisma.cliente.create({
      data: {
        ...validatedData,
        normalizedCnpj,
        empresaId: context.empresaId,
      },
    });

    logInfo('Cliente criado', context, {
      clienteId: cliente.id,
      cnpj: cliente.cnpj,
      razaoSocial: cliente.razaoSocial,
    });

    return createSuccessResponse(cliente, context);

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
    logError('Erro ao criar cliente', appError, context);
    return createErrorResponse(appError, context);
  }
}