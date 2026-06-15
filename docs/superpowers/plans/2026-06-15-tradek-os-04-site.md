# TradeK OS — Plano 04: Site público + Agente IA (executado)

**Goal:** Site público 100% fiel ao protótipo (`site.jsx` + `tradek.css` + `ui.jsx`), com catálogo vindo do banco e captação de lead real.

**Diretriz do usuário:** portar FIELMENTE os designs/cores do protótipo (não UI genérica); rotas `/admin` e `/cliente`. Ver memória [[tradek-design-fidelity]].

## Entregue
- **Design system trazido pro app:** `app/src/styles/tradek.css` (classes `.btn/.panel/.pill/.field/.moto-tile/.tbl/.eyebrow/...`) importado no `main.tsx`; assets em `app/public/` (`tradek-logo.png`, `motos/*.png`); primitivos portados em `app/src/components/tradek/ui.tsx` (Icon ~55, Btn, Pill, Logo, Score, Avatar, UNITS).
- **8 páginas** em `app/src/features/site/pages.tsx` (Home, SCF, Procurement, Motos, Sobre, FAQ, Contato, Obrigado) + `SiteLayout.tsx` (nav sticky + footer + agente), markup portado quase verbatim com `<Link>`.
- **Catálogo do banco:** `useProducts()` lê `tradek.products` publicados; cards + comparativo com as 7 motos seedadas.
- **Agente TradeK** (`AgentWidget.tsx`): fluxo guiado fiel do protótipo, criando lead REAL.
- **Captação real:** Edge Function `public-lead` (service role) insere company+contact+lead+interaction; usada pelo agente e pelo form de contato.
- **Rotas:** `/` → `/site`; site em `/site/*`; renomeado `/portal` → `/cliente` (layout `ClienteLayout`, login variante `cliente`).

## Verificação
- `npm run build` verde. Screenshots: Home fiel ao protótipo; `/site/motos` lista as 7 motos do banco com preço FOB. Function `public-lead` testada: cria lead (confirmado no banco via REST).

## Pendente (próximos planos)
- Agente conversacional real com Claude (Plano 07) substitui o fluxo scriptado.
- `--no-verify-jwt` na `public-lead`: endurecer com rate-limit/captcha no Plano 09.
