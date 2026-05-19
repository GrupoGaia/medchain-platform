# MedChain — Contexto do Projeto para IA

## O que é o MedChain

Plataforma SaaS de prontuário eletrônico com soberania do paciente. O paciente controla quem acessa seus dados gerando tokens de acesso temporários. O médico solicita acesso, um familiar (ou o próprio paciente) autoriza, o token expira automaticamente, e tudo fica registrado em auditoria.

**Persona principal:** João Batista, 61 anos, hipertenso com múltiplos médicos e histórico espalhado.

**Fluxo central de emergência:**
1. Médico solicita acesso via portal web
2. Familiar recebe notificação no app mobile e autoriza
3. Token temporário gerado (duração configurável)
4. Médico acessa apenas o necessário no portal
5. Paciente vê o registro na auditoria

**Contexto:** entrega acadêmica. Grupo pequeno (2-4 pessoas). Prazo ~2 meses. Demo via Expo Go + Vercel.

---

## Repositórios

- **Código:** https://github.com/MedChainGaia/medchain-platform (este repo)
- **Docs:** https://github.com/MedChainGaia/medchain-docs
- **Organização GitHub:** MedChainGaia

---

## Diretório de trabalho

```
C:\Workspace\Projetos\MedChain\medchain-platform
```

**Atenção:** `G:\Meu Drive\` é o Google Drive do usuário. Nunca instalar node_modules lá.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Mobile | Expo SDK 54, React Native 0.81.5, NativeWind 4.x, expo-router 6.x |
| Web | Next.js 15 App Router, TypeScript, Tailwind CSS 3, shadcn/ui |
| Backend (MVP) | Next.js Route Handlers |
| Banco | Supabase Postgres + Prisma ORM |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Validação | Zod em `packages/api-contract` |
| Domínio | `packages/domain` (token create/validate) |
| Deploy web | Vercel |
| Demo mobile | Expo Go via QR code |

---

## Estrutura do monorepo

```
medchain-platform/
├── apps/
│   ├── mobile/          # Expo (paciente)
│   └── web/             # Next.js (portal médico + API)
├── packages/
│   ├── api-contract/    # Schemas Zod compartilhados
│   ├── domain/          # Regras de negócio (tokens, autorização)
│   ├── ui-tokens/       # Paleta, tipografia
│   └── config/          # ESLint, TS, Prettier base
├── prisma/
│   └── schema.prisma    # 10 entidades completas
├── apps/web/
│   ├── lib/
│   │   ├── prisma.ts    # singleton PrismaClient
│   │   └── session.ts   # cookie de sessão (Fase 2, sem auth real)
│   ├── prisma/
│   │   └── seed.ts      # seed com @faker-js/faker pt_BR
│   └── app/
│       ├── api/         # Route Handlers REST
│       └── medico/      # Portal médico (login, dashboard, solicitar, prontuario)
├── docs/
│   └── roadmap-fases.md # Detalhamento das Fases 2-6
└── CLAUDE.md            # este arquivo
```

---

## Estado atual das fases

| Fase | Status |
|---|---|
| 0 — Fundação do monorepo | ✅ Concluída |
| 1 — Protótipo mobile com mocks | ✅ Concluída |
| 2 — API, banco e portal médico | ✅ Concluída — banco migrado e seed aplicado no Supabase |
| 3 — Autenticação e perfis | ✅ Concluída — branch `fase-3/auth`, commit `2e191d5` |
| 4 — Documentos e storage | ⏳ Próxima |
| 5 — Qualidade, observabilidade e demo | — |
| 6 — Pós-MVP (opcional) | — |

Detalhamento completo em `docs/roadmap-fases.md`.

---

## Fase 3 — O que foi implementado

### Web

- `apps/web/lib/supabase/` — clientes `server.ts` (SSR cookies), `browser.ts` (Client Components), `admin.ts` (service role, server-only)
- `apps/web/middleware.ts` — protege `/medico/*`; redireciona para `/medico/login` se sem sessão (Edge-compatible)
- `apps/web/lib/session.ts` — reescrito: `getCurrentUser()`, `requireDoctor()`, `requirePatient()` usando `supabase.auth.getUser()`
- `apps/web/lib/api-auth.ts` — `getApiUser()` suporta cookie (web) e Bearer token (mobile); `unauthorized()`, `forbidden()`
- Todas as 7 API Routes exigem autenticação + verificam role/ownership; `professionalId` derivado da sessão (não mais do body)
- Novos endpoints: `GET /api/me`, `GET /api/me/documents`, `GET /api/access-tokens`, `POST /api/users`
- `apps/web/prisma/seed.ts` — reescrito com `supabaseAdmin.auth.admin.createUser()`; idempotente via `getOrCreateAuthUser()`
- `apps/web/app/medico/login/page.tsx` — formulário email/senha com server action; painel de credenciais de demo
- Portal médico completo usa `requireDoctor()` em todas as páginas e server actions

### Mobile

- `apps/mobile/src/services/supabase.ts` — `createClient` com `ExpoSecureStoreAdapter`
- `apps/mobile/src/services/api.ts` — `authedFetch<T>()` injeta JWT; objeto `api` com todos os endpoints
- `apps/mobile/src/context/AuthProvider.tsx` — context com `session`, `loading`, `signIn`, `signUp`, `signOut`
- `apps/mobile/app/(auth)/` — telas `login.tsx` e `cadastro.tsx`
- `apps/mobile/src/context/AppStore.tsx` — refatorado de reducer+mocks para chamadas reais via `api.*`
- Todas as abas (início, permissões, histórico, perfil) consomem dados reais da API; mocks removidos
- Logout funcional em `perfil.tsx` via `useAuth().signOut()`
- `apps/web/prisma/schema.prisma` — `birthDate` tornado `DateTime?` (opcional para signup mobile)

### Credenciais de demo (senha: `medchain123`)

| Email | Perfil |
|---|---|
| `carlos.silva@medchain.demo` | Médico — Cardiologia |
| `ana.ferreira@medchain.demo` | Médico — Clínica Geral |
| `paulo.mendes@medchain.demo` | Médico — Endocrinologia |
| `joao.batista@exemplo.com` | Paciente (persona principal) |

### Decisões da Fase 3

- **`authId` vs `id`**: `User.authId` = UUID do Supabase Auth; `User.id` = UUID do Prisma. Nunca confundir.
- **Prisma usa service role**: bypassa RLS por default. Auth enforced no código (middleware + handlers).
- **Bearer token no mobile**: `getApiUser()` tenta cookie primeiro, depois `Authorization: Bearer <jwt>`.
- **Seed idempotente**: `getOrCreateAuthUser()` tenta criar; se email já existe, recupera via `listUsers`.

### Pendências da Fase 3 — EXECUTAR ANTES DE QUALQUER OUTRA COISA

> **ATENÇÃO: estas duas etapas são obrigatórias antes de iniciar a Fase 4 ou testar o app.**

**1. Aplicar migration `make_birthdate_optional`** (banco estava inacessível no último commit):
```powershell
cd apps/web
node_modules/.bin/prisma migrate dev --name make_birthdate_optional
```

**2. Rodar o seed** para criar os 10 usuários reais no Supabase Auth:
```powershell
cd apps/web
node_modules/.bin/tsx prisma/seed.ts
```

**3. Sub-fase 3.5 — RLS (defense-in-depth)**: ainda não implementada. Criar migration manual com `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` e policies por role. Plano detalhado em `~/.claude/plans/sim-gere-um-plano-dapper-shore.md` (sub-fase 3.5).

---

## Fase 2 — O que foi implementado

### Infraestrutura

- `apps/web/package.json`: adicionados `@prisma/client`, `prisma`, `tsx`, `@faker-js/faker`; configurado `"prisma": { "seed": "node_modules/.bin/tsx prisma/seed.ts" }` — sem a chave `"schema"` pois o schema está no local padrão (`apps/web/prisma/schema.prisma`)
- `apps/web/lib/prisma.ts`: singleton PrismaClient com padrão global para hot reload
- `apps/web/lib/session.ts`: cookie `medchain_doctor_id` para "sessão" provisória até a Fase 3

### Seed (`apps/web/prisma/seed.ts`)

- 2 instituições (Hospital São Lucas, UPA Centro)
- 3 médicos (Carlos Silva — Cardiologia, Ana Ferreira — Clínica Geral, Paulo Mendes — Endocrinologia)
- 5 pacientes (João Batista + 4 gerados com faker pt_BR)
- 20 documentos médicos distribuídos
- 3 solicitações: 1 aprovada + token ativo (45min), 1 pendente, 1 expirada
- Logs de auditoria correspondentes

### Route Handlers (`apps/web/app/api/`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/access-requests` | Médico cria solicitação |
| GET  | `/api/access-requests/[id]` | Detalhes da solicitação |
| POST | `/api/access-requests/[id]/approve` | Paciente/familiar aprova |
| POST | `/api/access-requests/[id]/deny` | Paciente/familiar nega |
| POST | `/api/tokens/[id]/revoke` | Revoga token |
| GET  | `/api/audit-logs` | Histórico (query param `patientId`) |
| GET  | `/api/patients/[id]/documents` | Docs do paciente (query param `professionalId`) |

### Portal médico (`apps/web/app/medico/`)

- `/medico/login` — seleção de médico (provisório, substituído por Supabase Auth na Fase 3)
- `/medico/dashboard` — acessos ativos, pendentes e contador por especialidade
- `/medico/solicitar` — formulário de solicitação de acesso (server action)
- `/medico/prontuario/[patientId]` — dados do paciente, documentos, banner de expiração, encerrar acesso

### Decisões da Fase 2

- **Seed em `apps/web/prisma/`** (não na raiz): evita problema de resolução de módulos no pnpm — `tsx` roda a partir de `apps/web/` e encontra `@prisma/client` normalmente
- **Sessão provisória por cookie** `medchain_doctor_id`: simplifica a demo; Fase 3 substitui por `supabase.auth.getSession()`
- **Log de ACCESS no prontuario**: criado a cada carregamento da página (append-only, comportamento correto de auditoria)
- **Token expirado detectado na requisição**: sem job externo; validação lazy no acesso

---

## Fase 1 — O que foi implementado

### Mobile (`apps/mobile/`)

- **Tabs:** Início, Histórico, Permissões, Perfil — todas conectadas a dados reais do store
- **AppStore** (`src/context/AppStore.tsx`): Context + useReducer com actions APPROVE_REQUEST, DENY_REQUEST, REVOKE_TOKEN
- **Mocks** (`src/services/mocks/data.ts`): paciente João Batista, 2 contatos de emergência, 2 médicos, 5 exames, 1 pedido pendente, 1 token ativo
- **Tela de autorização** (`app/autorizacao/[id].tsx`): modal estilo WhatsApp com SIM/NÃO + confirmação
- **NativeWind ativo**: `global.css` importado em `app/_layout.tsx`, `tailwind.config.js` correto, `metro.config.js` com `withNativeWind`

### Packages

- `packages/domain/src/tokens/create.ts` — criação de token com expiração
- `packages/domain/src/tokens/validate.ts` — validação, expiração e `formatMinutesRemaining()`
- `packages/api-contract/src/access-request.ts` e `access-token.ts` — schemas Zod

### Prisma

- `prisma/schema.prisma` completo com 10 entidades: User, PatientProfile, EmergencyContact, HealthProfessionalProfile, Institution, MedicalDocument, AccessRequest, AccessToken, AccessLog + enums

---

## Decisões técnicas relevantes

- **Schema Prisma em `apps/web/prisma/`** (não na raiz): a raiz do monorepo tem `prisma/schema.prisma` como referência histórica, mas o schema ativo e usado pelo Prisma CLI é `apps/web/prisma/schema.prisma`. O `package.json` do web **não deve** ter a chave `"schema"` no bloco `"prisma"` — sem ela, o Prisma usa o local padrão (`prisma/schema.prisma` relativo ao package). Isso resolve o bug de auto-install do Prisma CLI que tentava rodar `pnpm add` a partir da raiz do workspace (onde falha).
- **Seed via `node_modules/.bin/tsx`**: o comando `tsx prisma/seed.ts` não funciona no Windows porque `prisma db seed` roda via cmd.exe sem o PATH de `node_modules/.bin`. O seed está configurado como `node_modules/.bin/tsx prisma/seed.ts` no `package.json`.
- **Dois arquivos de env necessários**: `.env` (lido pelo Prisma CLI) e `.env.local` (lido pelo Next.js). O `.env` precisa ter apenas `DATABASE_URL` e `DIRECT_URL`. O `.env.local` tem também as vars `NEXT_PUBLIC_*`. Ambos devem estar no `.gitignore`. A senha do banco contém caracteres especiais — usar sempre URL-encoded: `x-1YIr8%3A10k%26` (`:` → `%3A`, `&` → `%26`).
- **Packages são TypeScript-puro**: não têm build step. Turborepo usa `typecheck` como dependência, não `build`.
- **expo-router com rota dinâmica**: usar `{ pathname: "/autorizacao/[id]" as never, params: { id } }` no `router.push()` enquanto os tipos não são regenerados pelo servidor.
- **NativeWind v4**: não usa mais `plugins: ["nativewind/babel"]` no `babel.config.js`. Só `jsxImportSource: "nativewind"` no preset.
- **SDK 54 (não 55)**: downgrade necessário porque o Expo Go disponível não suportava SDK 55. SDK 54 = expo@54, expo-router@6.x, react-native@0.81.5.
- **tailwind.config.js no mobile**: não importa `@medchain/ui-tokens` — Tailwind executa em Node e não consegue avaliar TypeScript puro. Cores estão inline.
- **Sempre rodar com `--clear`** depois de mudar `babel.config.js` ou `metro.config.js`.

---

## Comandos do dia a dia

```powershell
# Desenvolvimento (roda mobile + web juntos)
pnpm dev

# Mobile isolado com cache limpo (usar após mudar config Babel/Metro)
cd apps/mobile && npx expo start --clear

# Verificação antes de commitar
pnpm typecheck
pnpm lint

# Banco (Fase 2 em diante) — rodar de dentro de apps/web/
cd apps/web
node_modules/.bin/prisma migrate dev --name <nome>
node_modules/.bin/tsx prisma/seed.ts   # seed direto (mais confiável que prisma db seed no Windows)
node_modules/.bin/prisma studio
```

---

## Regras de Git deste projeto

- Todo trabalho em branch separada, exceto se o usuário confirmar commit direto na `main`
- Nunca executar `git push` — o usuário faz manualmente pelo GitHub Desktop
- Commits com `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Próximos passos (Fase 4 — Documentos e Storage)

Antes de iniciar, executar as **Pendências da Fase 3** descritas acima.

Fase 4 envolve:
1. Upload de PDFs/imagens para Supabase Storage
2. Endpoint `POST /api/me/documents` — upload com validação de tipo/tamanho
3. Visualização de documentos no mobile (PDF viewer ou WebView)
4. Tela de upload no portal médico
5. Políticas de Storage vinculadas ao RLS (só o paciente/profissional autorizado acessa)

Detalhamento completo em `docs/roadmap-fases.md`.
