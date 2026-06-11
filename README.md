# medchain-platform

Monorepo principal do MedChain. Contém o app mobile (paciente/familiar), o portal web (médico), packages compartilhados e a API.

## Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- Expo Go instalado no celular (para testar o mobile)
- Conta no Supabase (para as fases 2 em diante)

## Setup inicial

```bash
pnpm install
cp apps/web/.env.local.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
# preencher as variáveis de ambiente nos arquivos .env.local
```

## Rodar em desenvolvimento

```bash
pnpm dev
```

Isso sobe:
- `apps/web` em `http://localhost:3000` (portal médico Next.js)
- `apps/mobile` com QR code para Expo Go

## Desenvolvimento local com Docker + Supabase

Pré-requisitos adicionais:

- Docker Desktop
- Supabase CLI

Suba o Supabase local:

```bash
supabase start
```

Copie as chaves exibidas pelo comando para:

- `apps/web/.env.local`, usando `apps/web/.env.local.example` como base
- `apps/mobile/.env.local`, usando `apps/mobile/.env.example` como base

Aplique migrations e seed no banco local:

```bash
cd apps/web
node_modules/.bin/prisma migrate dev
node_modules/.bin/tsx prisma/seed.ts
```

Suba web e mobile em Docker:

```bash
docker compose up --build
```

Serviços principais:

- Web/API: `http://localhost:3000`
- Supabase API: `http://localhost:54321`
- Supabase Studio: `http://localhost:54323`
- Expo Metro: `http://localhost:8081`

Para testar no celular físico com Expo Go, configure `EXPO_PUBLIC_API_URL` com o IP local da máquina, não `localhost`.

## Estrutura

```
apps/
  mobile/        Expo + React Native + NativeWind (paciente e familiar)
  web/           Next.js 15 App Router + Tailwind + shadcn/ui (médico)
packages/
  api-contract/  Schemas Zod compartilhados entre mobile e web
  domain/        Regras de negócio: tokens, autorização, auditoria
  ui-tokens/     Paleta de cores, tipografia, espaçamentos
  config/        Configurações base: ESLint, TypeScript, Prettier
prisma/
  schema.prisma  Modelo de dados
  seed.ts        Dados fictícios para desenvolvimento
```

## Comandos úteis

```bash
pnpm lint          # lint em todos os apps e packages
pnpm typecheck     # checagem de tipos em todos
pnpm test          # testes em todos
pnpm build         # build completo
```

## Branches

- `main`: código estável
- `develop`: integração do grupo
- `feat/*`: novas funcionalidades
- `fix/*`: correções

## Documentação

Documentação do projeto (roadmap, arquitetura, decisões) está em:  
https://github.com/MedChainGaia/medchain-docs
