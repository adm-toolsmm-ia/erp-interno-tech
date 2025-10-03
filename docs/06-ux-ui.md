# 🎨 UX/UI Guidelines — ERPInternoTech

> Documento base para o Cursor seguir em todas as telas.

---

## 1. Layout Geral
- Sidebar fixa com breadcrumbs (Empresa > Cliente > Projeto).
- Cabeçalho do módulo sempre visível com título e ações principais.
- Contexto atual (empresa/cliente selecionado) destacado no topo.
- Layout responsivo:
  - Mobile <640px → stack simples.
  - Tablet 641–1024px → sidebar recolhível.
  - Desktop >1024px → sidebar fixa + conteúdo central.

---

## 2. Paleta de Cores por Status
- **Verde** → sucesso, aprovado, ativo.
- **Amarelo** → pendente, em andamento.
- **Vermelho** → erro, rejeitado, cancelado.
- **Azul** → informação, neutro.
- **Cinza** → desabilitado, arquivado.

---

## 3. Design Tokens
- **Spacing**: múltiplos de 4px.
- **Radius**: 2xl (16px) para cards e modais.
- **Shadow**: soft-md em cards, lg em modais.
- **Fonte**: Sans-serif (Inter), hierarquia → xl (títulos), lg (subtítulos), base (texto).
- **Ícones**: Lucide.

---

## 4. Microinterações
- Skeletons para carregamento.
- Toasts para confirmações/erros.
- Hover e active states em botões/cards.
- Transições suaves com Framer Motion.

---

## 5. Acessibilidade
- Contraste WCAG AA.
- Navegação por teclado (Tab + Shift+Tab).
- `aria-label` em botões icônicos.
- ESC sempre fecha modal/drawer.
