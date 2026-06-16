# TradeK OS — Otimização mobile do site público (Design)

**Data:** 2026-06-16
**Escopo:** site público (`/`, `/scf`, `/proc`, `/motos`, `/sobre`, `/faq`, `/contato`, `/obrigado`) + `SiteLayout` (nav/footer) + `AgentWidget`. **NÃO** inclui `/admin` nem `/cliente`.

## Objetivo

Tornar o site público totalmente usável e premium no celular. Hoje ele não tem **nenhuma** adaptação mobile: a 390px o `documentElement.scrollWidth` é ~802px (412px de scroll horizontal), a nav de 6 links + 2 botões estoura a tela e a tipografia/grids são fixos de desktop. **O desktop (≥1025px) deve permanecer pixel-idêntico.**

## Abordagem (C — híbrida)

Tipografia e grids escalam **fluidamente** (sem breakpoint) via `clamp()` e `repeat(auto-fit, minmax())`. Um único breakpoint de "flip" em **≤768px** reorganiza o que precisa (hero empilha, nav vira hambúrguer, footer colapsa), com micro-ajuste em **≤480px**. Os estilos inline de layout das páginas são substituídos por classes responsivas em `tradek.css` (media query de CSS não sobrescreve `style` inline).

## Unidades de trabalho

### 1. Fundação responsiva (`app/src/styles/tradek.css`)
- Token `--gutter: clamp(20px, 5vw, 40px)` (padding lateral das seções).
- Classe `.wrap` — container: `max-width:1280px; margin-inline:auto; padding-inline:var(--gutter)`.
- Tipografia fluida (classes): `.disp-hero { font-size:clamp(32px,9vw,60px) }`, `.disp-h1 { clamp(28px,6vw,52px) }`, `.disp-h2 { clamp(24px,4.5vw,40px) }`, `.disp-h3 { clamp(19px,3vw,26px) }` — todas com `line-height` proporcional.
- Grids: `.grid-auto { display:grid; gap:clamp(12px,2vw,20px); grid-template-columns:repeat(auto-fit,minmax(220px,1fr)) }`; `.grid-2`, `.grid-3`, `.grid-4` que colapsam para 1 coluna em `≤768px` (e 2 colunas onde fizer sentido em tablet).
- Rede de segurança: `html,body { overflow-x:hidden }`.
- Regra: **nenhuma** dessas mudanças altera o render ≥1025px.

### 2. Menu mobile — overlay full-screen (`SiteLayout.tsx`)
- `SiteNav` ganha botão hambúrguer visível só em `≤768px` (classe `.nav-burger`); os links/CTAs inline ganham classe `.nav-desktop` escondida em `≤768px`.
- Estado `menuOpen` (useState) no `SiteNav`.
- Overlay: `position:fixed; inset:0; z-index:60; background:var(--bg)`; 6 links empilhados (`clamp(20px,6vw,26px)`), CTAs **Portal do cliente** (ghost) e **Falar com agente** (lime) full-width no rodapé; botão X no topo.
- Comportamento: trava `document.body` scroll quando aberto; fecha ao tocar em link, no X, ou tecla `Esc`; reabre nav ao voltar pra ≥769px.

### 3. Adaptação das páginas (`pages.tsx`) — troca inline → classes responsivas
- **Home (`SiteHome`):** hero `1.15fr .85fr` → empilha (`.grid-hero`: 1 col ≤768, texto antes dos cards); métricas `repeat(4,1fr)` → `.grid-4` (2×2 no mobile); "primeira conversa" `repeat(3,1fr)` → `.grid-3` (1 col); botões do hero full-width ≤480.
- **`/scf` `/proc` `/motos` `/sobre`:** grids `repeat(3,1fr)` → `.grid-3`/`.grid-auto`; catálogo de motos → 1 col (2 em tablet via auto-fit); headings → `.disp-h1`/`.disp-h2`; paddings → `--gutter`.
- **`/contato`:** grid de campos 2-col → 1 coluna ≤768; inputs full-width; alvos de toque ≥44px.
- **`/faq` `/obrigado`:** escala de tipo (`.disp-h1`/`.disp-h2`) + `--gutter`.

### 4. AgentWidget mobile (`AgentWidget.tsx`)
- Em `≤768px` o painel do chat vira bottom sheet quase tela-cheia (`inset:0` ou `top:auto;height:88vh;width:100vw;border-radius:16px 16px 0 0`), pra o chat ser usável. O botão flutuante (FAB) continua no canto inferior direito.

### 5. Toque & acessibilidade
- Todos os elementos interativos ≥44px de alvo em `≤768px` (botões/links da nav, FAB, inputs).
- Overlay do menu: fecha em `Esc`, foco move pro overlay ao abrir.

## Verificação (Playwright)

Em **360px, 390px, 414px** (celulares), **768px** (tablet) e **1280px** (desktop), para cada uma das 8 páginas:
1. `documentElement.scrollWidth <= innerWidth` (**zero scroll horizontal**).
2. Screenshot de cada página (revisão visual).
3. Menu mobile: abre no hambúrguer, mostra 6 links + 2 CTAs, fecha no X/link/Esc.
4. AgentWidget: abre em bottom sheet usável no mobile.
5. **Desktop 1280px: comparação visual confirma que ficou idêntico** ao atual.

## Critérios de aceite
- Zero scroll horizontal nas 8 páginas em 360/390/414/768px.
- Nav mobile funcional (overlay full-screen) e desktop intacto.
- Tipografia legível e grids colapsados; alvos de toque ≥44px.
- Build (`tsc + vite`) limpo; deploy em produção via merge no `main`.
