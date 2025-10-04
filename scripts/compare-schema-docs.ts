#!/usr/bin/env tsx
/**
 * Script para comparar schema Prisma com documentação
 */

import { readFileSync } from 'fs';
import { join } from 'path';

function extractModels(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  const models: Record<string, string[]> = {};
  
  // Extrair modelos e seus campos
  const modelRegex = /^model (\w+) \{(.*?)^\}/gms;
  let match;
  
  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const modelContent = match[2];
    
    // Extrair campos
    const fieldRegex = /^\s+(\w+)(\??)\s+(\w+)/gm;
    const fields: string[] = [];
    let fieldMatch;
    
    while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
      const fieldName = fieldMatch[1];
      const isOptional = fieldMatch[2] === '?';
      const fieldType = fieldMatch[3];
      fields.push(`${fieldName}${isOptional ? '?' : ''}: ${fieldType}`);
    }
    
    models[modelName] = fields;
  }
  
  return models;
}

function compareModels() {
  console.log('🔍 Comparando schema Prisma com documentação...\n');
  
  try {
    const schemaModels = extractModels('prisma/schema.prisma');
    const docsModels = extractModels('docs/00-contexto.md');
    
    const allModelNames = new Set([
      ...Object.keys(schemaModels),
      ...Object.keys(docsModels)
    ]);
    
    let differences = 0;
    
    for (const modelName of allModelNames) {
      const schemaFields = schemaModels[modelName] || [];
      const docsFields = docsModels[modelName] || [];
      
      if (schemaFields.length === 0) {
        console.log(`❌ Modelo ${modelName} não encontrado no schema Prisma`);
        differences++;
        continue;
      }
      
      if (docsFields.length === 0) {
        console.log(`❌ Modelo ${modelName} não encontrado na documentação`);
        differences++;
        continue;
      }
      
      // Comparar campos
      const schemaFieldNames = new Set(schemaFields.map(f => f.split(':')[0].trim()));
      const docsFieldNames = new Set(docsFields.map(f => f.split(':')[0].trim()));
      
      const missingInDocs = [...schemaFieldNames].filter(f => !docsFieldNames.has(f));
      const missingInSchema = [...docsFieldNames].filter(f => !schemaFieldNames.has(f));
      
      if (missingInDocs.length > 0 || missingInSchema.length > 0) {
        console.log(`\n📋 Modelo: ${modelName}`);
        
        if (missingInDocs.length > 0) {
          console.log(`  ❌ Campos faltando na documentação: ${missingInDocs.join(', ')}`);
          differences++;
        }
        
        if (missingInSchema.length > 0) {
          console.log(`  ❌ Campos faltando no schema: ${missingInSchema.join(', ')}`);
          differences++;
        }
      } else {
        console.log(`✅ Modelo ${modelName} está sincronizado`);
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`  Total de modelos: ${allModelNames.size}`);
    console.log(`  Diferenças encontradas: ${differences}`);
    
    if (differences === 0) {
      console.log('\n🎉 Schema e documentação estão sincronizados!');
    } else {
      console.log('\n⚠️  Ações necessárias:');
      console.log('  1. Atualizar documentação com campos faltando');
      console.log('  2. Atualizar schema com campos faltando');
      console.log('  3. Verificar se campos foram removidos intencionalmente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao comparar modelos:', error);
  }
}

compareModels();
