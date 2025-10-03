import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // 1. Criar Empresa
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: '12345678000195' },
    update: {},
    create: {
      razaoSocial: 'Tech Solutions Ltda',
      nomeFantasia: 'Tech Solutions',
      cnpj: '12345678000195',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      telefone: '(11) 99999-9999',
      email: 'contato@techsolutions.com',
      website: 'https://techsolutions.com',
    },
  });

  console.log('✅ Empresa criada:', empresa.nomeFantasia);

  // 2. Criar Usuários
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@techsolutions.com' },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: 'Administrador',
      email: 'admin@techsolutions.com',
      senhaHash: '$2b$10$dummy.hash.for.testing', // Hash dummy para MVP
      role: 'administrador',
    },
  });

  const vendedor = await prisma.usuario.upsert({
    where: { email: 'vendedor@techsolutions.com' },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: 'João Vendedor',
      email: 'vendedor@techsolutions.com',
      senhaHash: '$2b$10$dummy.hash.for.testing',
      role: 'vendedor',
    },
  });

  console.log('✅ Usuários criados');

  // 3. Criar Status de Projeto
  const statusProjetos = [
    { nome: 'Prospecção', fase: 'inicial', cor: '#fbbf24', ordem: 1 },
    { nome: 'Em Andamento', fase: 'execucao', cor: '#3b82f6', ordem: 2 },
    { nome: 'Concluído', fase: 'finalizado', cor: '#10b981', ordem: 3 },
    { nome: 'Cancelado', fase: 'cancelado', cor: '#ef4444', ordem: 4 },
    { nome: 'Pausado', fase: 'pausado', cor: '#6b7280', ordem: 5 },
  ];

  for (const status of statusProjetos) {
    await prisma.statusProjeto.upsert({
      where: { 
        empresaId_nome: { 
          empresaId: empresa.id, 
          nome: status.nome 
        } 
      },
      update: {},
      create: {
        empresaId: empresa.id,
        nome: status.nome,
        fase: status.fase,
        cor: status.cor,
        ordem: status.ordem,
      },
    });
  }

  console.log('✅ Status de projeto criados');

  // 4. Criar Categorias de Documento
  const categorias = [
    { nome: 'Proposta Comercial', descricao: 'Propostas comerciais e orçamentos', cor: '#8b5cf6', ordem: 1 },
    { nome: 'Contrato', descricao: 'Contratos e acordos', cor: '#06b6d4', ordem: 2 },
    { nome: 'Ata de Reunião', descricao: 'Atas e relatórios de reuniões', cor: '#f59e0b', ordem: 3 },
    { nome: 'Relatório Técnico', descricao: 'Relatórios técnicos e análises', cor: '#10b981', ordem: 4 },
    { nome: 'Orçamento', descricao: 'Orçamentos e cotações', cor: '#ef4444', ordem: 5 },
    { nome: 'Outros', descricao: 'Outros documentos', cor: '#6b7280', ordem: 6 },
  ];

  for (const categoria of categorias) {
    await prisma.categoriaDocumento.upsert({
      where: { 
        empresaId_nome: { 
          empresaId: empresa.id, 
          nome: categoria.nome 
        } 
      },
      update: {},
      create: {
        empresaId: empresa.id,
        nome: categoria.nome,
        descricao: categoria.descricao,
        cor: categoria.cor,
        ordem: categoria.ordem,
      },
    });
  }

  console.log('✅ Categorias de documento criadas');

  // 5. Criar Produtos/Serviços
  const produtos = [
    { nome: 'Desenvolvimento Web', tipo: 'servico', categoria: 'Desenvolvimento', status: 'ativo' },
    { nome: 'Consultoria TI', tipo: 'servico', categoria: 'Consultoria', status: 'ativo' },
    { nome: 'Suporte Técnico', tipo: 'servico', categoria: 'Suporte', status: 'ativo' },
    { nome: 'Licença Software', tipo: 'produto', categoria: 'Licenças', status: 'ativo' },
  ];

  for (const produto of produtos) {
    await prisma.produtoServico.upsert({
      where: { 
        empresaId_nome_tipo: { 
          empresaId: empresa.id, 
          nome: produto.nome,
          tipo: produto.tipo
        } 
      },
      update: {},
      create: {
        empresaId: empresa.id,
        nome: produto.nome,
        tipo: produto.tipo,
        categoria: produto.categoria,
        status: produto.status,
      },
    });
  }

  console.log('✅ Produtos/Serviços criados');

  // 6. Criar Clientes
  const clientes = [
    {
      razaoSocial: 'Empresa ABC Ltda',
      nomeFantasia: 'ABC Corp',
      cnpj: '98765432000123',
      normalizedCnpj: '98765432000123',
      segmento: 'Tecnologia',
      logradouro: 'Av. Paulista, 1000',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      telefone: '(11) 3333-3333',
      email: 'contato@abccorp.com',
    },
    {
      razaoSocial: 'Indústria XYZ S.A.',
      nomeFantasia: 'XYZ Indústria',
      cnpj: '11111111000111',
      normalizedCnpj: '11111111000111',
      segmento: 'Indústria',
      logradouro: 'Rua Industrial, 500',
      numero: '500',
      bairro: 'Distrito Industrial',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '02000-000',
      telefone: '(11) 4444-4444',
      email: 'contato@xyzindustria.com',
    },
  ];

  for (const clienteData of clientes) {
    const cliente = await prisma.cliente.upsert({
      where: { 
        empresaId_cnpj: { 
          empresaId: empresa.id, 
          cnpj: clienteData.cnpj 
        } 
      },
      update: {},
      create: {
        empresaId: empresa.id,
        ...clienteData,
      },
    });

    // Criar representante para o cliente
    await prisma.representante.create({
      data: {
        clienteId: cliente.id,
        nome: `Representante ${cliente.nomeFantasia}`,
        email: cliente.email,
        telefone: cliente.telefone,
      },
    });

    // Criar setor para o cliente
    await prisma.setorCliente.create({
      data: {
        clienteId: cliente.id,
        nome: 'Comercial',
        coordenadorId: vendedor.id,
      },
    });
  }

  console.log('✅ Clientes criados');

  // 7. Criar Projetos
  const statusProspecao = await prisma.statusProjeto.findFirst({
    where: { empresaId: empresa.id, nome: 'Prospecção' },
  });

  const clientesCriados = await prisma.cliente.findMany({
    where: { empresaId: empresa.id },
  });

  for (let i = 0; i < clientesCriados.length; i++) {
    const cliente = clientesCriados[i];
    const projeto = await prisma.projeto.upsert({
      where: { 
        empresaId_assunto_clienteId: { 
          empresaId: empresa.id, 
          assunto: `Projeto ${i + 1} - ${cliente.nomeFantasia}`,
          clienteId: cliente.id
        } 
      },
      update: {},
      create: {
        empresaId: empresa.id,
        clienteId: cliente.id,
        assunto: `Projeto ${i + 1} - ${cliente.nomeFantasia}`,
        descricao: `Descrição do projeto para ${cliente.nomeFantasia}`,
        statusId: statusProspecao?.id,
        dataEntrada: new Date(),
        prioridade: i === 0 ? 'ALTA' : 'MEDIA',
        tags: ['importante', 'novo'],
        gerenteId: admin.id,
        vendedorId: vendedor.id,
      },
    });

    // Vincular produtos ao projeto
    const produtosCriados = await prisma.produtoServico.findMany({
      where: { empresaId: empresa.id },
      take: 2, // Vincular 2 produtos por projeto
    });

    for (const produto of produtosCriados) {
      await prisma.projetoProduto.upsert({
        where: { 
          projetoId_produtoId: { 
            projetoId: projeto.id, 
            produtoId: produto.id 
          } 
        },
        update: {},
        create: {
          empresaId: empresa.id,
          projetoId: projeto.id,
          produtoId: produto.id,
        },
      });
    }
  }

  console.log('✅ Projetos criados');

  // 8. Criar Documentos de exemplo
  const categoriaProposta = await prisma.categoriaDocumento.findFirst({
    where: { empresaId: empresa.id, nome: 'Proposta Comercial' },
  });

  const projetosCriados = await prisma.projeto.findMany({
    where: { empresaId: empresa.id },
  });

  for (const projeto of projetosCriados) {
    await prisma.documento.upsert({
      where: { 
        empresaId_storageKey: { 
          empresaId: empresa.id, 
          storageKey: `proposta-${projeto.id}.pdf` 
        } 
      },
      update: {},
      create: {
        empresaId: empresa.id,
        projetoId: projeto.id,
        categoriaId: categoriaProposta?.id,
        titulo: `Proposta Comercial - ${projeto.assunto}`,
        descricao: `Proposta comercial para o projeto ${projeto.assunto}`,
        storageKey: `proposta-${projeto.id}.pdf`,
        contentType: 'application/pdf',
        sizeBytes: 1024000, // 1MB
        checksum: `hash-${projeto.id}`,
        storageProvider: 'supabase',
        createdById: admin.id,
        updatedById: admin.id,
        tags: ['proposta', 'comercial'],
        metadata: {
          versao: '1.0',
          autor: admin.nome,
        },
      },
    });
  }

  console.log('✅ Documentos criados');

  console.log('🎉 Seeds concluídos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
