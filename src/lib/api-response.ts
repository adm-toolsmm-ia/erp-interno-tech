import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { TenantContext } from './tenant';

export interface ApiResponse<T = any> {
  data: T;
  meta: {
    tenantId: string;
    requestId: string;
    timestamp: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function createSuccessResponse<T>(
  data: T,
  context: TenantContext,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    data,
    meta: {
      tenantId: context.empresaId,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      ...(pagination && { pagination }),
    },
  };

  return NextResponse.json(response);
}

export function createErrorResponse(
  error: AppError,
  context: TenantContext
): NextResponse {
  const response = {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    },
    meta: {
      tenantId: context.empresaId,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
  };

  return NextResponse.json(response, { status: error.statusCode });
}

export function createValidationErrorResponse(
  errors: Record<string, string[]>,
  context: TenantContext
): NextResponse {
  const response = {
    error: {
      message: 'Erro de validação',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: errors,
    },
    meta: {
      tenantId: context.empresaId,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
  };

  return NextResponse.json(response, { status: 400 });
}

export function createNotFoundResponse(
  resource: string,
  context: TenantContext
): NextResponse {
  const response = {
    error: {
      message: `${resource} não encontrado`,
      code: 'NOT_FOUND',
      statusCode: 404,
    },
    meta: {
      tenantId: context.empresaId,
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
  };

  return NextResponse.json(response, { status: 404 });
}
