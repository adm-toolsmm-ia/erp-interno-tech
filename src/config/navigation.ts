/**
 * Navegação do ERP derivada de docs/01-modulos.md
 * Fonte de verdade: docs/01-modulos.md
 */

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Visão Geral",
        href: "/dashboard",
        icon: "LayoutDashboard"
      }
    ]
  },
  {
    title: "Gestão",
    items: [
      {
        label: "Empresas",
        href: "/empresas",
        icon: "Building2"
      },
      {
        label: "Clientes",
        href: "/clientes",
        icon: "Users"
      },
      {
        label: "Projetos",
        href: "/projetos",
        icon: "FolderOpen"
      }
    ]
  },
  {
    title: "Documentos",
    items: [
      {
        label: "Documentos",
        href: "/documentos",
        icon: "FileText"
      },
      {
        label: "Orçamentos",
        href: "/orcamentos",
        icon: "DollarSign"
      }
    ]
  },
  {
    title: "Configurações",
    items: [
      {
        label: "Status de Projetos",
        href: "/status-projetos",
        icon: "Flag"
      },
      {
        label: "Categorias de Documentos",
        href: "/categorias-documentos",
        icon: "Tag"
      },
      {
        label: "Produtos/Serviços",
        href: "/produtos-servicos",
        icon: "Package"
      },
      {
        label: "Fornecedores",
        href: "/fornecedores",
        icon: "Truck"
      }
    ]
  }
];

// Mapa de rotas canônico derivado dos módulos documentados
export const routeMap = [
  // Dashboard
  "/dashboard",
  
  // Empresas
  "/empresas",
  "/empresas/create",
  "/empresas/[id]/edit",
  
  // Clientes
  "/clientes",
  "/clientes/create",
  "/clientes/[id]/edit",
  
  // Projetos
  "/projetos",
  "/projetos/create",
  "/projetos/[id]/edit",
  "/projetos/kanban", // Kanban para projetos (tem status)
  
  // Documentos
  "/documentos",
  "/documentos/create",
  "/documentos/[id]/edit",
  
  // Orçamentos
  "/orcamentos",
  "/orcamentos/create",
  "/orcamentos/[id]/edit",
  "/orcamentos/kanban", // Kanban para orçamentos (tem status)
  
  // Configurações
  "/status-projetos",
  "/status-projetos/create",
  "/status-projetos/[id]/edit",
  
  "/categorias-documentos",
  "/categorias-documentos/create",
  "/categorias-documentos/[id]/edit",
  
  "/produtos-servicos",
  "/produtos-servicos/create",
  "/produtos-servicos/[id]/edit",
  
  "/fornecedores",
  "/fornecedores/create",
  "/fornecedores/[id]/edit"
] as const;

// Entidades que têm status/etapas (para Kanban)
export const entitiesWithStatus = [
  "projetos",
  "orcamentos"
] as const;

// Entidades principais do sistema
export const mainEntities = [
  "empresas",
  "clientes", 
  "projetos",
  "documentos",
  "orcamentos"
] as const;

// Configurações por entidade
export const entityConfig = {
  empresas: {
    label: "Empresa",
    plural: "Empresas",
    icon: "Building2",
    hasStatus: false,
    hasKanban: false
  },
  clientes: {
    label: "Cliente",
    plural: "Clientes", 
    icon: "Users",
    hasStatus: false,
    hasKanban: false
  },
  projetos: {
    label: "Projeto",
    plural: "Projetos",
    icon: "FolderOpen", 
    hasStatus: true,
    hasKanban: true
  },
  documentos: {
    label: "Documento",
    plural: "Documentos",
    icon: "FileText",
    hasStatus: false,
    hasKanban: false
  },
  orcamentos: {
    label: "Orçamento",
    plural: "Orçamentos",
    icon: "DollarSign",
    hasStatus: true,
    hasKanban: true
  },
  "status-projetos": {
    label: "Status de Projeto",
    plural: "Status de Projetos",
    icon: "Flag",
    hasStatus: false,
    hasKanban: false
  },
  "categorias-documentos": {
    label: "Categoria de Documento",
    plural: "Categorias de Documentos",
    icon: "Tag",
    hasStatus: false,
    hasKanban: false
  },
  "produtos-servicos": {
    label: "Produto/Serviço",
    plural: "Produtos/Serviços",
    icon: "Package",
    hasStatus: false,
    hasKanban: false
  },
  fornecedores: {
    label: "Fornecedor",
    plural: "Fornecedores",
    icon: "Truck",
    hasStatus: false,
    hasKanban: false
  }
} as const;

export type EntityKey = keyof typeof entityConfig;
export type RoutePath = typeof routeMap[number];
