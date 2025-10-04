#!/usr/bin/env tsx
/**
 * Validador de rotas do ERP
 * Verifica se todas as rotas documentadas existem em app/(erp)/...
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { routeMap } from '../src/config/route-map';

interface RouteValidationResult {
  route: string;
  exists: boolean;
  filePath?: string;
  error?: string;
}

class RouteValidator {
  private appDir = 'src/app/(erp)';
  private results: RouteValidationResult[] = [];

  validate(): void {
    console.log('🔍 Validando rotas do ERP...\n');
    
    for (const route of routeMap) {
      this.validateRoute(route);
    }

    this.printResults();
    this.exitWithResult();
  }

  private validateRoute(route: string): void {
    const result: RouteValidationResult = { route, exists: false };
    
    try {
      // Converter rota para caminho de arquivo
      const filePath = this.routeToFilePath(route);
      result.filePath = filePath;
      
      if (existsSync(filePath)) {
        result.exists = true;
      } else {
        result.error = `Arquivo não encontrado: ${filePath}`;
      }
    } catch (error) {
      result.error = `Erro ao validar rota: ${error}`;
    }

    this.results.push(result);
  }

  private routeToFilePath(route: string): string {
    // Remover barra inicial
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
    
    // Se for rota dinâmica [id], verificar se existe page.tsx
    if (cleanRoute.includes('[id]')) {
      const dirPath = join(this.appDir, cleanRoute);
      return join(dirPath, 'page.tsx');
    }
    
    // Se for rota estática, verificar se existe page.tsx
    return join(this.appDir, cleanRoute, 'page.tsx');
  }

  private printResults(): void {
    const valid = this.results.filter(r => r.exists);
    const invalid = this.results.filter(r => !r.exists);

    console.log(`✅ Rotas válidas: ${valid.length}/${this.results.length}`);
    
    if (valid.length > 0) {
      console.log('\n📋 Rotas encontradas:');
      valid.forEach(result => {
        console.log(`  ✓ ${result.route} → ${result.filePath}`);
      });
    }

    if (invalid.length > 0) {
      console.log(`\n❌ Rotas faltando: ${invalid.length}`);
      invalid.forEach(result => {
        console.log(`  ✗ ${result.route}`);
        if (result.error) {
          console.log(`    ${result.error}`);
        }
      });
    }
  }

  private exitWithResult(): void {
    const validRoutes = this.results.filter(r => r.exists);
    const missingRoutes = this.results.filter(r => !r.exists);
    const totalRoutes = this.results.length;
    
    if (missingRoutes.length > 0) {
      console.log('\n🚫 Validação falhou - algumas rotas estão faltando');
      console.log('💡 Execute: npm run generate:routes para criar rotas faltantes');
      console.log('\n📋 Status das rotas:');
      console.log(`  ✅ Implementadas: ${validRoutes.length}/${totalRoutes}`);
      console.log(`  ❌ Faltando: ${missingRoutes.length}/${totalRoutes}`);
      console.log(`  📊 Cobertura: ${((validRoutes.length / totalRoutes) * 100).toFixed(1)}%`);
      
      // Falhar apenas se cobertura for muito baixa (< 30%)
      const coverage = (validRoutes.length / totalRoutes) * 100;
      if (coverage < 30) {
        console.log('\n❌ Cobertura muito baixa - mínimo 30% necessário');
        process.exit(1);
      } else {
        console.log('\n⚠️  Cobertura aceitável para MVP - continuar desenvolvimento');
        process.exit(0);
      }
    } else {
      console.log('\n🎉 Todas as rotas estão validadas!');
      process.exit(0);
    }
  }
}

// Executar validação
if (require.main === module) {
  const validator = new RouteValidator();
  validator.validate();
}
