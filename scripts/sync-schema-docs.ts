#!/usr/bin/env tsx
/**
 * Script para sincronizar automaticamente a documentação com o schema Prisma
 */

import { readFileSync, writeFileSync } from 'fs';

// Campos adicionais para cada modelo
const additionalFields = {
  'Orcamento': {
    fields: ['numero', 'titulo', 'descricao', 'dataCriacao', 'dataValidade', 'desconto', 'valorFinal', 'observacoes'],
    insertAfter: 'assunto'
  },
  'Documento': {
    fields: ['descricao', 'tags', 'metadata'],
    insertAfter: 'titulo'
  },
  'StatusProjeto': {
    fields: ['empresa', 'cor', 'ordem'],
    insertAfter: 'nome'
  },
  'CategoriaDocumento': {
    fields: ['empresa', 'descricao', 'cor', 'ordem'],
    insertAfter: 'nome'
  }
};

function syncDocumentation() {
  console.log('🔄 Sincronizando documentação com schema Prisma...\n');
  
  try {
    let content = readFileSync('docs/00-contexto.md', 'utf-8');
    
    for (const [modelName, config] of Object.entries(additionalFields)) {
      console.log(`📝 Atualizando modelo ${modelName}...`);
      
      // Encontrar o modelo na documentação
      const modelRegex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?)(\\s+${config.insertAfter}\\s+[^\\n]*)([\\s\\S]*?)(\\n\\})`, 'm');
      const match = content.match(modelRegex);
      
      if (match) {
        const beforeField = match[1];
        const fieldLine = match[2];
        const afterField = match[3];
        const closingBrace = match[4];
        
        // Adicionar campos extras após o campo especificado
        const newFields = config.fields.map(field => `  ${field}    String?`).join('\n');
        const updatedContent = beforeField + fieldLine + '\n' + newFields + afterField + closingBrace;
        
        content = content.replace(modelRegex, updatedContent);
        console.log(`  ✅ Campos adicionados: ${config.fields.join(', ')}`);
      } else {
        console.log(`  ⚠️  Modelo ${modelName} não encontrado ou formato diferente`);
      }
    }
    
    // Salvar arquivo atualizado
    writeFileSync('docs/00-contexto.md', content);
    
    console.log('\n🎉 Documentação sincronizada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('  1. Revisar campos adicionados');
    console.log('  2. Ajustar tipos de dados se necessário');
    console.log('  3. Executar script de comparação novamente');
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar documentação:', error);
  }
}

syncDocumentation();
