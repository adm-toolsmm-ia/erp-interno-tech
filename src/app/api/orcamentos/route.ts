import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { extractTenantFromRequest } from '@/lib/tenant';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/api-response';
import { createOrcamentoSchema, updateOrcamentoSchema, paginationSchema, orcamentoFilterSchema } from '@/lib/validations';
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

    const filterParams = orcamentoFilterSchema.parse({
      projetoId: searchParams.get('projetoId'),
      clienteId: searchParams.get('clienteId'),
      statusId: searchParams.get('statusId'),
      status: searchParams.get('status'),
      prioridade: searchParams.get('prioridade'),
      segmento: searchParams.get('segmento'),
      orcamentoStatus: searchParams.get('orcamentoStatus'),
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
      ...(filterParams.clienteId && { 
        projeto: { clienteId: filterParams.clienteId }
      }),
      ...(filterParams.orcamentoStatus && { status: filterParams.orcamentoStatus }),
      ...(filterParams.segmento && {
        projeto: { 
          cliente: { segmento: filterParams.segmento }
        },
      }),
      ...(search && {
        OR: [
          { numero: { contains: search, mode: 'insensitive' as const } },
          { titulo: { contains: search, mode: 'insensitive' as const } },
          { descricao: { contains: search, mode: 'insensitive' as const } },
          { projeto: { assunto: { contains: search, mode: 'insensitive' as const } } },
          { projeto: { cliente: { razaoSocial: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }),
    };

    const [orcamentos, total] = await Promise.all([
      prisma.orcamento.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          projeto: {
            select: {
              id: true,
              assunto: true,
              prioridade: true,
              dataEntrada: true,
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
            },
          },
          fornecedor: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          itens: {
            select: {
              id: true,
              descricao: true,
              quantidade: true,
              precoUnitario: true,
              subtotal: true,
              fornecedor: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
          _count: {
            select: {
              itens: true,
            },
          },
        },
      }),
      prisma.orcamento.count({ where }),
    ]);

    // Calcular totais dos orçamentos
    const orcamentosComTotais = orcamentos.map(orcamento => {
      const totalItens = orcamento.itens.reduce((sum, item) => sum + Number(item.subtotal), 0);
      const valorTotal = Number(orcamento.valorTotal);
      const desconto = orcamento.desconto ? Number(orcamento.desconto) : 0;
      const valorFinal = valorTotal - desconto;

      return {
        ...orcamento,
        calculos: {
          totalItens,
          valorTotal,
          desconto,
          valorFinal,
          diferenca: valorTotal !== totalItens ? valorTotal - totalItens : 0,
        },
      };
    });

    logInfo('Orçamentos listados', context, {
      total,
      page,
      limit,
      filters: { 
        search, 
        projetoId: filterParams.projetoId,
        clienteId: filterParams.clienteId,
        status: filterParams.orcamentoStatus,
      },
    });

    return createSuccessResponse(
      orcamentosComTotais,
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
    logError('Erro ao listar orçamentos', appError, context);
    return createErrorResponse(appError, context);
  }
}

export async function POST(request: NextRequest) {
  const context = extractTenantFromRequest(request);
  
  try {
    const body = await request.json();
    const validatedData = createOrcamentoSchema.parse(body);

    // Verificar se projeto existe e pertence à empresa
    const projeto = await prisma.projeto.findFirst({
      where: {
        id: validatedData.projetoId,
        empresaId: context.empresaId,
        deletedAt: null,
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
          },
        },
      },
    });

    if (!projeto) {
      throw new AppError('Projeto não encontrado', 404, 'PROJECT_NOT_FOUND');
    }

    // Verificar se fornecedor existe (se fornecido)
    if (validatedData.fornecedorId) {
      const fornecedor = await prisma.fornecedor.findFirst({
        where: {
          id: validatedData.fornecedorId,
          empresaId: context.empresaId,
        },
      });

      if (!fornecedor) {
        throw new AppError('Fornecedor não encontrado', 404, 'SUPPLIER_NOT_FOUND');
      }
    }

    // Verificar se número já existe na empresa
    const existingOrcamento = await prisma.orcamento.findFirst({
      where: {
        empresaId: context.empresaId,
        numero: validatedData.numero,
        deletedAt: null,
      },
    });

    if (existingOrcamento) {
      throw new AppError('Número de orçamento já existe', 409, 'ORCAMENTO_NUMBER_EXISTS');
    }

    // Calcular valores se não fornecidos
    const valorTotal = validatedData.valorTotal || 0;
    const desconto = validatedData.desconto || 0;
    const valorFinal = Math.max(0, valorTotal - desconto);

    const orcamento = await prisma.orcamento.create({
      data: {
        ...validatedData,
        empresaId: context.empresaId,
        valorTotal,
        desconto,
        valorFinal,
        dataCriacao: new Date(),
        dataValidade: new Date(validatedData.dataValidade),
        createdById: context.userId, // TODO: Implementar autenticação
      },
    });

    // Buscar orçamento com relacionamentos
    const orcamentoCompleto = await prisma.orcamento.findUnique({
      where: { id: orcamento.id },
      include: {
        projeto: {
          select: {
            id: true,
            assunto: true,
            prioridade: true,
            dataEntrada: true,
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
          },
        },
        fornecedor: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        itens: {
          select: {
            id: true,
            descricao: true,
            quantidade: true,
            precoUnitario: true,
            subtotal: true,
          },
        },
        _count: {
          select: {
            itens: true,
          },
        },
      },
    });

    logInfo('Orçamento criado', context, {
      orcamentoId: orcamento.id,
      numero: orcamento.numero,
      titulo: orcamento.titulo,
      projetoId: orcamento.projetoId,
      valorTotal: orcamento.valorTotal,
      status: orcamento.status,
    });

    return createSuccessResponse(orcamentoCompleto, context);

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.reduce((acc: Record<string, string[]>, err) => {
        const field = err.path.join('.');
        if (!acc[field]) acc[field] = [];
        acc[field].push(err.message);
        return acc;
      }, {});
      
      return createValidationErrorResponse(validationErrors, context);
    }

    const appError = handleError(error);
    logError('Erro ao criar orçamento', appError, context);
    return createErrorResponse(appError, context);
  }
}
