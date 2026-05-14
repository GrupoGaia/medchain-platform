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
│   ├── schema.prisma    # 10 entidades completas
│   └── seed.ts          # TODO: implementar na Fase 2
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
| 2 — API, banco e portal médico | ⏳ Próxima |
| 3 — Autenticação e perfis | — |
| 4 — Documentos e storage | — |
| 5 — Qualidade, observabilidade e demo | — |
| 6 — Pós-MVP (opcional) | — |

Detalhamento completo em `docs/roadmap-fases.md`.

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

# Banco (Fase 2 em diante)
pnpm --filter @medchain/web exec npx prisma migrate dev --name <nome>
pnpm --filter @medchain/web exec npx prisma db seed
pnpm --filter @medchain/web exec npx prisma studio
```

---

## Regras de Git deste projeto

- Todo trabalho em branch separada, exceto se o usuário confirmar commit direto na `main`
- Nunca executar `git push` — o usuário faz manualmente pelo GitHub Desktop
- Commits com `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Próximos passos (Fase 2)

1. Criar projeto no Supabase e copiar as connection strings para `apps/web/.env.local`
2. Rodar `npx prisma migrate dev --name init` para criar as tabelas
3. Implementar o `prisma/seed.ts` com `@faker-js/faker` (pt_BR)
4. Criar os Route Handlers em `apps/web/app/api/`
5. Criar as telas do portal médico em `apps/web/app/(medico)/`
6. Substituir o AppStore do mobile por chamadas reais à API
