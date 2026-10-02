# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Visão geral

Gerador de Landing Pages com IA (projeto de TCC). Monorepo sem workspace raiz, com dois pacotes npm independentes:

- `api/` — backend Fastify 5 + TypeScript (ESM), com quatro agentes LangChain que chamam um LLM via OpenRouter e persistem no Supabase.
- `web/` — frontend Next.js 16 (App Router) + React 19 + Tailwind CSS v4.

Não existe `package.json` na raiz: rode os comandos dentro de `api/` ou `web/`. Todo o texto da UI, os prompts e as mensagens de erro estão em **português do Brasil**; mantenha esse padrão.

## Comandos

```bash
# Backend (porta 3333 por padrão)
cd api && npm install
npm run dev      # tsx watch src/index.ts
npm run build    # tsc -> dist/
npm start        # node dist/index.js

# Frontend (porta 3000)
cd web && npm install
npm run dev
npm run build
npm run lint     # ESLint 9 (eslint-config-next core-web-vitals + typescript)
```

Não há testes automatizados nem lint configurados no backend. Para checar tipos na API use `npx tsc --noEmit` dentro de `api/`.

## Variáveis de ambiente

`api/.env`:
- `PORT` (padrão 3333)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY` — lida pelos agentes (não é usada `OPENAI_API_KEY`, apesar do SDK `ChatOpenAI`).

`web/.env.local`:
- `NEXT_PUBLIC_API_URL` — URL base da API (ex: `http://localhost:3333`). Todas as chamadas do frontend dependem dela.

## Arquitetura

### Fluxo de geração (pipeline multiagente)

O wizard em `web/src/app/create/page.tsx` (client component, 4 etapas) chama a API em sequência:

1. **Objetivo** — usuário escolhe um de `OBJECTIVES` (`leads`, `venda`, `eventos`, `materiais`, `mvp`) e responde às 3 perguntas de `QUESTIONS_MAP`. As respostas viram uma string "P: ... / R: ..." via `getSummary()`, enviada como `strategy` em todas as chamadas seguintes.
2. **Estratégia** — `POST /api/strategy/evaluate` → `StrategistAgent` devolve `{status, feedback, suggestions, score}`. O frontend só libera a próxima etapa com `score >= 70`.
3. **Identidade** — `POST /api/design/generate` (com `vibe`) → `DesignerAgent` devolve `{colors, logoPrompt, imagePrompts[3], visualStyle}`.
4. **Prévia** — ao entrar na etapa, `POST /api/copy/generate` → `CopywriterAgent` (hero, 3 features, socialProof, 3 FAQs, footer). Ao finalizar, `POST /api/projects/save` → `AssemblerAgent` consolida design + copy no JSON final, que é gravado na tabela `projects` do Supabase; em seguida redireciona para `/preview/[id]`.

### Backend (`api/src`)

- `index.ts` concentra tudo: setup do Fastify/CORS, cliente Supabase, instâncias dos agentes e todas as rotas. Os bodies são lidos com `request.body as any` (sem validação Zod nas rotas).
- `GET /api/image-proxy?prompt=&seed=` faz proxy para `image.pollinations.ai` com `fetchWithRetry` (backoff exponencial em HTTP 429 e falhas de rede). Imagens nunca são armazenadas: o JSON guarda só os **prompts**, e o frontend monta a URL do proxy na hora de renderizar (`getImg` / `getImageUrl`, sempre com `seed=123`).
- Tabela `projects` do Supabase (inferida pelo código): `id`, `objective`, `strategy_summary`, `data` (JSON da página montada), `created_at`. Não há migrations no repositório.

### Agentes (`api/src/agents/*.ts`)

Os quatro seguem o mesmo padrão — ao criar ou alterar um agente, replique-o:
- Um schema Zod + `StructuredOutputParser.fromZodSchema` injeta `{format_instructions}` num `PromptTemplate`.
- `ChatOpenAI` apontando para `https://openrouter.ai/api/v1`, modelo `google/gemini-2.0-flash-001` (temperaturas: Strategist 0.7, Designer 0.7, Copywriter 0.8, Assembler 0.3).
- A resposta é limpa de cercas ```` ```json ```` e lida com `JSON.parse` — o schema Zod **não** é validado em tempo de execução, apenas descrito no prompt.
- Cada arquivo chama `config()` do dotenv por conta própria.

Os prompts de imagem do Designer devem ser em **inglês** (Pollinations); o restante do conteúdo em português.

### Contrato de dados (atenção ao alterar)

O schema de saída do `AssemblerAgent` (`name`, `design.colors`, `design.images.{logo, hero, features[]}`, `content.{hero, features[{title, description, icon}], socialProof, faq, footerText}`) é o formato consumido diretamente por `web/src/app/preview/[id]/page.tsx` e `web/src/app/portfolio/page.tsx`. As interfaces TypeScript do frontend são duplicadas à mão em cada página — não há tipos compartilhados. Mudou um schema no backend, atualize as interfaces e os componentes que o renderizam.

`features[].icon` é o nome de um ícone do `lucide-react`; a prévia resolve dinamicamente com `(LucideIcons as any)[feature.icon]` e cai em `Sparkles` se não existir.

### Frontend (`web/src`)

- Rotas: `/` (home), `/create` (wizard), `/portfolio` (lista `GET /api/projects`), `/preview/[id]` (renderiza a landing page salva com as cores do projeto em estilos inline).
- Páginas são client components (`"use client"`) que fazem `fetch` direto; não há camada de serviços, estado global nem pasta de componentes compartilhados.
- `@/*` → `web/src/*`. Use `cn()` de `@/lib/utils` (clsx + tailwind-merge) para compor classes.
- Tailwind v4 via `@tailwindcss/postcss` e `@import "tailwindcss"` em `globals.css` (não há `tailwind.config`).
- Next.js 16 é recente e pode ter APIs diferentes das versões anteriores; consulte a documentação em `web/node_modules/next/dist/docs/` antes de usar recursos do framework de que não tiver certeza.
