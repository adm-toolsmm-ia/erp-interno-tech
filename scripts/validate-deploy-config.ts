#!/usr/bin/env tsx

/**
 * Script para validar configurações de deploy GitHub + Vercel
 * Executa verificações antes de fazer push para produção
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class DeployConfigValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  validate(): ValidationResult {
    console.log('🔍 Validando configurações de deploy...\n');

    this.validateVercelJson();
    this.validateNextConfig();
    this.validatePackageJson();
    this.validateGitHubWorkflow();
    this.validateSecretsConfig();

    const isValid = this.errors.length === 0;

    if (isValid) {
      console.log('✅ Todas as configurações estão corretas!\n');
    } else {
      console.log('❌ Problemas encontrados:\n');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Avisos:\n');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return {
      isValid,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private validateVercelJson(): void {
    console.log('📋 Validando vercel.json...');
    
    try {
      const vercelJson = JSON.parse(readFileSync('vercel.json', 'utf8'));
      
      // Verificações obrigatórias
      if (!vercelJson.framework || vercelJson.framework !== 'nextjs') {
        this.errors.push('vercel.json: framework deve ser "nextjs"');
      }
      
      if (!vercelJson.installCommand || !vercelJson.installCommand.includes('npm ci')) {
        this.errors.push('vercel.json: installCommand deve usar "npm ci"');
      }
      
      if (!vercelJson.buildCommand || !vercelJson.buildCommand.includes('npm run build')) {
        this.errors.push('vercel.json: buildCommand deve usar "npm run build"');
      }

      // Verificações de segurança
      if (vercelJson.headers) {
        const apiHeaders = vercelJson.headers.find((h: any) => h.source === '/api/(.*)');
        if (apiHeaders && apiHeaders.headers) {
          const hasSecurityHeaders = apiHeaders.headers.some((header: any) => 
            header.key === 'X-Content-Type-Options' || 
            header.key === 'X-Frame-Options'
          );
          if (!hasSecurityHeaders) {
            this.warnings.push('vercel.json: Headers de segurança recomendados para APIs');
          }
        }
      }

      console.log('  ✅ vercel.json válido');
    } catch (error) {
      this.errors.push(`vercel.json: Erro ao ler arquivo - ${error}`);
    }
  }

  private validateNextConfig(): void {
    console.log('📋 Validando next.config.ts...');
    
    try {
      const nextConfigContent = readFileSync('next.config.ts', 'utf8');
      
      // Verificar se output standalone foi removido
      if (nextConfigContent.includes('output: \'standalone\'')) {
        this.errors.push('next.config.ts: output standalone deve ser removido (conflito com Vercel)');
      }

      // Verificar se poweredByHeader está desabilitado
      if (!nextConfigContent.includes('poweredByHeader: false')) {
        this.warnings.push('next.config.ts: poweredByHeader recomendado como false');
      }

      // Verificar headers de segurança
      if (!nextConfigContent.includes('X-Frame-Options')) {
        this.warnings.push('next.config.ts: Headers de segurança recomendados');
      }

      console.log('  ✅ next.config.ts válido');
    } catch (error) {
      this.errors.push(`next.config.ts: Erro ao ler arquivo - ${error}`);
    }
  }

  private validatePackageJson(): void {
    console.log('📋 Validando package.json...');
    
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      // Verificar scripts obrigatórios
      const requiredScripts = ['build', 'lint', 'type-check'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.errors.push(`package.json: Script "${script}" é obrigatório`);
        }
      }

      // Verificar se build inclui prisma generate
      if (packageJson.scripts?.build && !packageJson.scripts.build.includes('prisma generate')) {
        this.errors.push('package.json: build script deve incluir "prisma generate"');
      }

      // Verificar se postinstall está configurado
      if (!packageJson.scripts?.postinstall?.includes('prisma generate')) {
        this.warnings.push('package.json: postinstall deve incluir "prisma generate"');
      }

      console.log('  ✅ package.json válido');
    } catch (error) {
      this.errors.push(`package.json: Erro ao ler arquivo - ${error}`);
    }
  }

  private validateGitHubWorkflow(): void {
    console.log('📋 Validando GitHub workflow...');
    
    const workflowPath = '.github/workflows/deploy.yml';
    
    if (!existsSync(workflowPath)) {
      this.errors.push('GitHub workflow deploy.yml não encontrado');
      return;
    }

    try {
      const workflowContent = readFileSync(workflowPath, 'utf8');
      
      // Verificar se usa a action correta
      if (!workflowContent.includes('amondnet/vercel-action')) {
        this.errors.push('GitHub workflow: deve usar amondnet/vercel-action');
      }

      // Verificar secrets obrigatórios
      const requiredSecrets = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];
      for (const secret of requiredSecrets) {
        if (!workflowContent.includes(`secrets.${secret}`)) {
          this.errors.push(`GitHub workflow: deve usar secret ${secret}`);
        }
      }

      // Verificar se tem quality checks
      if (!workflowContent.includes('Quality Checks')) {
        this.warnings.push('GitHub workflow: Quality checks recomendados');
      }

      console.log('  ✅ GitHub workflow válido');
    } catch (error) {
      this.errors.push(`GitHub workflow: Erro ao ler arquivo - ${error}`);
    }
  }

  private validateSecretsConfig(): void {
    console.log('📋 Validando configuração de secrets...');
    
    try {
      const secretsConfig = JSON.parse(readFileSync('scripts/github-secrets-config.json', 'utf8'));
      
      // Verificar secrets obrigatórios
      const requiredSecrets = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];
      for (const secret of requiredSecrets) {
        if (!secretsConfig.secrets || !secretsConfig.secrets[secret]) {
          this.errors.push(`Secrets config: ${secret} é obrigatório`);
        }
      }

      // Verificar URLs
      if (!secretsConfig.secrets?.VERCEL_PRODUCTION_URL) {
        this.warnings.push('Secrets config: VERCEL_PRODUCTION_URL recomendado');
      }

      console.log('  ✅ Configuração de secrets válida');
    } catch (error) {
      this.errors.push(`Secrets config: Erro ao ler arquivo - ${error}`);
    }
  }
}

// Executar validação
const validator = new DeployConfigValidator();
const result = validator.validate();

if (!result.isValid) {
  console.log('\n🚨 Validação falhou! Corrija os erros antes de fazer deploy.\n');
  process.exit(1);
} else {
  console.log('\n🎉 Configurações prontas para deploy!\n');
  process.exit(0);
}
