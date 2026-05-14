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
cp apps/web/.env.example apps/web/.env.local
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

- `main` — código estável
- `develop` — integração do grupo
- `feat/*` — novas funcionalidades
- `fix/*` — correções
