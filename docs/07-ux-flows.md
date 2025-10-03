# 🔄 UX Flows — ERPInternoTech

> Documento de comportamento de telas e interações.

---

## 1. Visualização de Registros
- **Lista (Tabela)**:
  - Colunas com ordenação.
  - Filtros rápidos por chips (status, cliente).
  - Campo de busca global no topo.
- **Kanban (quando aplicável)**:
  - Colunas representam status.
  - Arrastar registro entre colunas atualiza status.
- Toggle para alternar Lista ↔ Kanban no cabeçalho.

---

## 2. Criação/Edição de Registros
- **Criação** → Modal sobreposto com formulário completo.
- **Edição** → Drawer lateral com tabs (Detalhes, Documentos, Orçamentos).
- Atalhos de teclado:
  - `Ctrl+K` → abre busca global.
  - `ESC` → fecha modal/drawer.

---

## 3. Empty States
- Quando não houver dados:
  - Mensagem clara (ex.: "Nenhum projeto encontrado").
  - Botão de ação primária (ex.: "Criar Projeto").
  - Ilustração leve (ícone Lucide).

---

## 4. Atalhos para Registros Vinculados
- Dentro de Projeto:
  - Botão rápido "Criar Documento".
  - Botão rápido "Criar Orçamento".
- Dentro de Cliente:
  - Botão rápido "Criar Projeto".
  - Botão rápido "Criar Contato".
- Usar **FAB (Floating Action Button)** para ação principal.

---

## 5. Visão 360º
- Estrutura hierárquica:
  1. **KPIs principais** (ex.: Projetos Ativos, Orçamentos Aprovados).
  2. **Linha do tempo de atividades recentes**.
  3. **Atas e Documentos vinculados**.
- Cards modulares, expansíveis (collapse/expand).
- Cards interativos → clique abre drawer com detalhes.

---

## 6. Exportação e Integrações
- Todas as tabelas devem ter:
  - Botão "Exportar CSV".
  - Botão "Exportar PDF" (opcional).
- Dashboards devem permitir exportar dados resumidos.
