#!/usr/bin/env tsx
/**
 * Verificador de onClick vazios
 * Falha se encontrar onClick={() => {}} ou onClick={() => {}}
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface OnClickIssue {
  file: string;
  line: number;
  content: string;
  type: 'empty' | 'console.log';
}

class OnClickValidator {
  private issues: OnClickIssue[] = [];
  private readonly srcDir = 'src';
  private readonly allowedExtensions = ['.tsx', '.ts', '.jsx', '.js'];

  validate(): void {
    console.log('🔍 Verificando onClick vazios...\n');
    
    this.scanDirectory(this.srcDir);
    this.printResults();
    this.exitWithResult();
  }

  private scanDirectory(dir: string): void {
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Pular node_modules e outros diretórios desnecessários
          if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
            this.scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = extname(fullPath);
          if (this.allowedExtensions.includes(ext)) {
            this.scanFile(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao escanear diretório ${dir}:`, error);
    }
  }

  private scanFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Verificar onClick vazios
        if (this.hasEmptyOnClick(line)) {
          this.issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: 'empty'
          });
        }
        
        // Verificar onClick com console.log (também problemático)
        if (this.hasConsoleLogOnClick(line)) {
          this.issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: 'console.log'
          });
        }
      });
    } catch (error) {
      console.warn(`⚠️ Erro ao ler arquivo ${filePath}:`, error);
    }
  }

  private hasEmptyOnClick(line: string): boolean {
    // Padrões de onClick vazios
    const emptyPatterns = [
      /onClick\s*=\s*{\s*\(\)\s*=>\s*{\s*}\s*}/,
      /onClick\s*=\s*{\s*\(\)\s*=>\s*{\s*}\s*}/,
      /onClick\s*=\s*{\s*\(\)\s*=>\s*\{\s*\}\s*}/,
      /onClick\s*=\s*{\s*\(\)\s*=>\s*\{\s*\}\s*}/,
    ];
    
    return emptyPatterns.some(pattern => pattern.test(line));
  }

  private hasConsoleLogOnClick(line: string): boolean {
    // Padrões de onClick com console.log
    const consolePatterns = [
      /onClick\s*=\s*{\s*\(\)\s*=>\s*{\s*console\.log\([^)]*\)\s*}\s*}/,
      /onClick\s*=\s*{\s*\(\)\s*=>\s*\{\s*console\.log\([^)]*\)\s*\}\s*}/,
    ];
    
    return consolePatterns.some(pattern => pattern.test(line));
  }

  private printResults(): void {
    if (this.issues.length === 0) {
      console.log('✅ Nenhum onClick vazio encontrado!');
      return;
    }

    console.log(`❌ Encontrados ${this.issues.length} onClick problemáticos:\n`);
    
    const groupedByFile = this.issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, OnClickIssue[]>);

    Object.entries(groupedByFile).forEach(([file, issues]) => {
      console.log(`📁 ${file}:`);
      issues.forEach(issue => {
        const icon = issue.type === 'empty' ? '🚫' : '⚠️';
        const type = issue.type === 'empty' ? 'VAZIO' : 'CONSOLE.LOG';
        console.log(`  ${icon} Linha ${issue.line}: ${type}`);
        console.log(`     ${issue.content}`);
      });
      console.log('');
    });

    console.log('💡 Dicas para corrigir:');
    console.log('   • Remova onClick vazios ou implemente funcionalidade');
    console.log('   • Substitua console.log por implementação real');
    console.log('   • Use handlers apropriados para cada ação');
  }

  private exitWithResult(): void {
    if (this.issues.length > 0) {
      console.log('\n🚫 Validação falhou - onClick vazios encontrados');
      console.log('💡 Execute: npm run fix:onclick para ver sugestões de correção');
      process.exit(1);
    } else {
      console.log('\n🎉 Validação passou! Todos os onClick estão implementados');
      process.exit(0);
    }
  }
}

// Executar validação
if (require.main === module) {
  const validator = new OnClickValidator();
  validator.validate();
}
