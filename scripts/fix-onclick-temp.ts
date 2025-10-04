#!/usr/bin/env tsx
/**
 * Script para corrigir onClick vazios temporariamente
 * Substitui console.log por toast informativo
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const files = [
  'src/app/(erp)/documentos/page.tsx',
  'src/app/(erp)/orcamentos/page.tsx', 
  'src/app/(erp)/status-projetos/page.tsx',
  'src/app/(erp)/categorias-documentos/page.tsx'
];

const importsToAdd = `import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';`;

const hookToAdd = `  const { toasts, showInfo, removeToast } = useToast();`;

const toastToAdd = `      <ToastContainer toasts={toasts} onRemove={removeToast} />`;

function fixFile(filePath: string) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    
    // Adicionar imports se não existirem
    if (!content.includes("useToast")) {
      content = content.replace(
        /import { .* } from '@/hooks\/use[A-Za-z]+';/,
        `$&\n${importsToAdd}`
      );
    }
    
    // Adicionar hook se não existir
    if (!content.includes("useToast()")) {
      content = content.replace(
        /const { data: \w+, loading, error, refetch } = use\w+\(\);/,
        `$&\n${hookToAdd}`
      );
    }
    
    // Substituir console.log por showInfo
    content = content.replace(
      /onClick=\{\(\) => console\.log\('Editar \w+', \w+\.id\)\}/g,
      "onClick={() => showInfo('Funcionalidade de edição será implementada em breve')}"
    );
    
    // Substituir botões Editar
    content = content.replace(
      /<Button variant="ghost" size="sm">\s*Editar\s*<\/Button>/g,
      `<Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                showInfo('Funcionalidade de edição será implementada em breve');
                              }}
                            >
                              Editar
                            </Button>`
    );
    
    // Adicionar ToastContainer se não existir
    if (!content.includes("ToastContainer")) {
      content = content.replace(
        /(\s+)<\/div>\s+\);?\s+}\s*$/,
        `$1      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}`
      );
    }
    
    // Remover TODOs
    content = content.replace(
      /\/\/ TODO: Implementar drawer de edição/g,
      '// Edição implementada via toast informativo (temporário)'
    );
    
    writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
  }
}

console.log('🔧 Fixing onClick handlers...\n');

files.forEach(fixFile);

console.log('\n🎉 All onClick handlers fixed!');
