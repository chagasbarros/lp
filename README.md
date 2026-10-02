# 🚀 AI Landing Page Generator

Sistema Full Stack para geração automatizada de Landing Pages utilizando Inteligência Artificial.

O projeto utiliza uma arquitetura baseada em múltiplos agentes de IA especializados para analisar objetivos de negócio, definir estratégias, criar identidade visual, gerar copywriting e montar páginas completas.

## 📋 Sobre o Projeto

O AI Landing Page Generator permite que usuários descrevam um objetivo de negócio e recebam uma Landing Page estruturada automaticamente através da colaboração de agentes inteligentes.

Cada agente possui uma responsabilidade específica dentro do processo de criação:

* Estratégia de marketing
* Design visual
* Copywriting
* Montagem final da página

Os projetos gerados podem ser armazenados e consultados posteriormente através da integração com Supabase.

---

## 🏗️ Arquitetura

```text
Usuário
   │
   ▼
Frontend (Next.js)
   │
   ▼
Backend API (Fastify)
   │
   ├── Strategist Agent
   ├── Designer Agent
   ├── Copywriter Agent
   └── Assembler Agent
   │
   ▼
Supabase Database
```

---

## ✨ Funcionalidades

### Estratégia

* Avaliação de objetivos de negócio
* Definição de estratégias de marketing
* Sugestões de posicionamento

### Design

* Geração de identidade visual
* Definição de estilos e elementos gráficos
* Sugestão de layouts

### Copywriting

* Geração automática de textos
* Headlines
* Call To Actions (CTA)
* Estrutura persuasiva

### Montagem

* Consolidação das informações geradas
* Estruturação final da Landing Page

### Persistência

* Salvar projetos gerados
* Listar projetos
* Consultar projetos específicos

### Imagens

* Proxy para geração de imagens utilizando IA
* Tratamento de rate limits
* Retry automático em falhas

---

# 🛠️ Tecnologias

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React

## Backend

* Node.js
* Fastify
* TypeScript
* Zod
* LangChain
* OpenRouter (modelo `google/gemini-2.0-flash-001`)
* Pollinations.ai (geração de imagens)
* Supabase

## Banco de Dados

* Supabase PostgreSQL

A API espera uma tabela `projects` com as colunas:

| Coluna             | Conteúdo                                         |
| ------------------ | ------------------------------------------------ |
| `id`               | Identificador do projeto (gerado pelo banco)     |
| `objective`        | Objetivo escolhido pelo usuário                  |
| `strategy_summary` | Respostas do formulário de estratégia            |
| `data`             | JSON da Landing Page montada pelo Assembler      |
| `created_at`       | Data de criação (usada para ordenar o portfólio) |

---

# 📁 Estrutura do Projeto

```text
├── api
│   ├── src
│   │   ├── agents
│   │   │   ├── StrategistAgent.ts
│   │   │   ├── DesignerAgent.ts
│   │   │   ├── CopywriterAgent.ts
│   │   │   └── AssemblerAgent.ts
│   │   └── index.ts
│   └── package.json
│
└── web
    ├── src
    │   ├── app
    │   │   ├── page.tsx              # Home
    │   │   ├── create/page.tsx       # Assistente de criação (4 etapas)
    │   │   ├── portfolio/page.tsx    # Lista de projetos salvos
    │   │   └── preview/[id]/page.tsx # Renderização da Landing Page
    │   └── lib
    │       └── utils.ts
    └── package.json
```

---

# 🤖 Agentes Inteligentes

## Strategist Agent

Responsável por:

* Analisar objetivos
* Definir estratégia
* Validar direcionamentos de marketing

## Designer Agent

Responsável por:

* Criar identidade visual
* Definir estilos
* Gerar direcionamentos de layout

## Copywriter Agent

Responsável por:

* Produzir textos persuasivos
* Criar headlines
* Desenvolver CTAs

## Assembler Agent

Responsável por:

* Integrar todas as respostas
* Construir a estrutura final da Landing Page

---

# 🔌 Endpoints

## Health Check

```http
GET /health
```

---

## Avaliar Estratégia

```http
POST /api/strategy/evaluate
```

### Body

```json
{
  "objective": "Vender curso online",
  "strategy": "Funil de aquisição"
}
```

---

## Gerar Design

```http
POST /api/design/generate
```

### Body

```json
{
  "objective": "Vender curso online",
  "strategy": "Funil de aquisição",
  "vibe": "Moderno"
}
```

---

## Gerar Copy

```http
POST /api/copy/generate
```

### Body

```json
{
  "objective": "Vender curso online",
  "strategy": "Funil de aquisição",
  "visualStyle": "Minimalista"
}
```

---

## Salvar Projeto

```http
POST /api/projects/save
```

---

## Listar Projetos

```http
GET /api/projects
```

---

## Buscar Projeto

```http
GET /api/projects/:id
```

---

## Proxy de Imagens

```http
GET /api/image-proxy?prompt=<prompt>&seed=<seed>
```

Gera a imagem via Pollinations.ai a partir do prompt (em inglês), com retry automático e backoff exponencial em caso de rate limit (HTTP 429). O parâmetro `seed` é opcional (padrão `123`).

---

# ⚙️ Variáveis de Ambiente

Backend (`api/.env`)

```env
PORT=3333

SUPABASE_URL=
SUPABASE_ANON_KEY=

OPENROUTER_API_KEY=
```

A chave é obtida em [openrouter.ai](https://openrouter.ai). Os agentes usam o SDK da OpenAI (via LangChain) apontando para a API do OpenRouter.

Frontend (`web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

---

# 🚀 Executando o Projeto

## Backend

```bash
cd api

npm install

npm run dev
```

Servidor:

```text
http://localhost:3333
```

---

## Frontend

```bash
cd web

npm install

npm run dev
```

Aplicação:

```text
http://localhost:3000
```

---

# 🎯 Conceitos Demonstrados

Este projeto demonstra conhecimentos em:

* Arquitetura Full Stack
* TypeScript
* Next.js
* Fastify
* Integração com IA
* LangChain
* APIs REST
* Supabase
* Design Patterns
* Arquitetura Multiagente
* Tratamento de Erros
* Retry Strategy
* Separação de Responsabilidades

---

# 🔮 Melhorias Futuras

* Autenticação de usuários
* Dashboard administrativo
* Histórico de versões
* Exportação para HTML
* Exportação para React
* Templates personalizáveis
* Deploy automático
* Monitoramento e métricas
* Testes automatizados

---

# 👨‍💻 Autor

**Chagas Barros**

Desenvolvedor Full Stack com foco em:

* Node.js
* TypeScript
* React
* Next.js
* Inteligência Artificial
* Arquitetura de Software

---

⭐ Se este projeto foi útil para você, deixe uma estrela no repositório.
